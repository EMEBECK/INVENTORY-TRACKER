const { sql } = require('@vercel/postgres');
const setupDb = require('../db');
const crypto = require('crypto');

// Helper to determine if we are using Postgres or SQLite
const isPostgres = () => !!process.env.POSTGRES_URL;

exports.getInventory = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let rows;

    if (isPostgres()) {
      if (search) {
        const searchTerm = `%${search}%`;
        rows = (await sql`
          SELECT * FROM items 
          WHERE name ILIKE ${searchTerm} OR sku ILIKE ${searchTerm}
          ORDER BY created_at DESC
        `).rows;
      } else {
        rows = (await sql`
          SELECT * FROM items 
          ORDER BY created_at DESC
        `).rows;
      }
    } else {
      const db = await setupDb();
      if (search) {
        rows = await db.all(
          'SELECT * FROM items WHERE name LIKE ? OR sku LIKE ? ORDER BY created_at DESC',
          [`%${search}%`, `%${search}%`]
        );
      } else {
        rows = await db.all('SELECT * FROM items ORDER BY created_at DESC');
      }
    }
    
    const itemsWithStatus = rows.map(item => ({
      ...item,
      is_low_stock: item.quantity <= item.threshold
    }));

    let filteredItems = itemsWithStatus;
    if (status) {
      if (status === 'out_of_stock') filteredItems = itemsWithStatus.filter(i => i.quantity === 0);
      else if (status === 'low_stock') filteredItems = itemsWithStatus.filter(i => i.quantity > 0 && i.is_low_stock);
      else if (status === 'healthy') filteredItems = itemsWithStatus.filter(i => i.quantity > 0 && !i.is_low_stock);
    }

    res.status(200).json({ success: true, data: filteredItems });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    let rows;
    if (isPostgres()) {
      rows = (await sql`SELECT DISTINCT category FROM items WHERE category IS NOT NULL AND category != ''`).rows;
    } else {
      const db = await setupDb();
      rows = await db.all('SELECT DISTINCT category FROM items WHERE category IS NOT NULL AND category != ""');
    }
    const categories = rows.map(r => r.category);
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { name, sku, category, quantity, threshold, price, supplier } = req.body;

    if (!name || quantity === undefined || threshold === undefined) {
      return res.status(400).json({ success: false, error: 'Name, quantity, and threshold are required' });
    }
    if (quantity < 0 || threshold < 0) {
      return res.status(400).json({ success: false, error: 'Quantity and threshold cannot be negative' });
    }

    const id = crypto.randomUUID();
    const price_per_unit = price || 0;
    const total_amount = quantity * price_per_unit;
    const report_date = new Date().toISOString().split('T')[0];
    
    if (isPostgres()) {
      try {
        await sql`
          INSERT INTO items (
            id, name, sku, category, quantity, threshold, price, price_per_unit, total_amount, supplier,
            date_purchased, quantity_purchased, purchase_amount, supplier_name, supplier_contact, supplier_address, notes
          )
          VALUES (
            ${id}, ${name}, ${sku}, ${category}, ${quantity}, ${threshold}, ${price}, ${price_per_unit}, ${total_amount}, ${supplier},
            ${req.body.date_purchased}, ${req.body.quantity_purchased}, ${req.body.purchase_amount},
            ${req.body.supplier_name}, ${req.body.supplier_contact}, ${req.body.supplier_address}, ${req.body.notes}
          )
        `;

        await sql`
          INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, price_per_unit, total_amount, report_date)
          VALUES (${crypto.randomUUID()}, ${id}, ${name}, ${quantity}, 'Add Item', 'Initial stock', ${price_per_unit}, ${total_amount}, ${report_date})
        `;

        await sql`INSERT INTO daily_reports (report_id, report_date) VALUES (${crypto.randomUUID()}, ${report_date}) ON CONFLICT (report_date) DO NOTHING`;
      } catch(err) {
        if (err.message.includes('unique constraint') || err.message.includes('sku')) {
          return res.status(400).json({ success: false, error: 'SKU already exists' });
        }
        throw err;
      }
    } else {
      const db = await setupDb();
      try {
        await db.run(
          `INSERT INTO items (
            id, name, sku, category, quantity, threshold, price, price_per_unit, total_amount, supplier,
            date_purchased, quantity_purchased, purchase_amount, supplier_name, supplier_contact, supplier_address, notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, name, sku, category, quantity, threshold, price, price_per_unit, total_amount, supplier,
            req.body.date_purchased, req.body.quantity_purchased, req.body.purchase_amount,
            req.body.supplier_name, req.body.supplier_contact, req.body.supplier_address, req.body.notes
          ]
        );

        await db.run(
          `INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, price_per_unit, total_amount, report_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), id, name, quantity, 'Add Item', 'Initial stock', price_per_unit, total_amount, report_date]
        );

        await db.run('INSERT OR IGNORE INTO daily_reports (report_id, report_date) VALUES (?, ?)', [crypto.randomUUID(), report_date]);
      } catch(err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ success: false, error: 'SKU already exists' });
        }
        throw err;
      }
    }

    let newItem;
    if (isPostgres()) {
      const { rows } = await sql`SELECT * FROM items WHERE id = ${id}`;
      newItem = rows[0];
    } else {
      const db = await setupDb();
      newItem = await db.get('SELECT * FROM items WHERE id = ?', id);
    }
    newItem.is_low_stock = newItem.quantity <= newItem.threshold;

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Item name cannot be empty' });
    }

    const report_date = new Date().toISOString().split('T')[0];

    if (isPostgres()) {
      await sql`UPDATE items SET name = ${name}, category = ${category}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
      await sql`
        INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, report_date)
        VALUES (${crypto.randomUUID()}, ${id}, ${name}, 0, 'Edit Item', 'Updated name/category', ${report_date})
      `;
      await sql`INSERT INTO daily_reports (report_id, report_date) VALUES (${crypto.randomUUID()}, ${report_date}) ON CONFLICT (report_date) DO NOTHING`;
    } else {
      const db = await setupDb();
      await db.run('UPDATE items SET name = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, category, id]);
      await db.run(
        `INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, report_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), id, name, 0, 'Edit Item', 'Updated name/category', report_date]
      );
      await db.run('INSERT OR IGNORE INTO daily_reports (report_id, report_date) VALUES (?, ?)', [crypto.randomUUID(), report_date]);
    }

    let updatedItem;
    if (isPostgres()) {
      const { rows } = await sql`SELECT * FROM items WHERE id = ${id}`;
      updatedItem = rows[0];
    } else {
      const db = await setupDb();
      updatedItem = await db.get('SELECT * FROM items WHERE id = ?', id);
    }

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    updatedItem.is_low_stock = updatedItem.quantity <= updatedItem.threshold;
    res.status(200).json({ success: true, data: updatedItem });
  } catch (err) {
    next(err);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { change_amount, update_type, reason, price_per_unit, total_amount } = req.body;

    if (!change_amount || !update_type) return res.status(400).json({ success: false, error: 'Missing required fields' });
    if (!['purchase', 'sale', 'adjustment'].includes(update_type)) return res.status(400).json({ success: false, error: 'Invalid update_type' });
    if (update_type === 'adjustment' && !reason) return res.status(400).json({ success: false, error: 'Reason required' });
    if (Math.abs(change_amount) === 0) return res.status(400).json({ success: false, error: 'Quantity must be non-zero' });
    if (price_per_unit !== undefined && price_per_unit < 0) return res.status(400).json({ success: false, error: 'Price per unit cannot be negative' });

    let item;
    if (isPostgres()) {
      const { rows } = await sql`SELECT name, quantity, threshold FROM items WHERE id = ${id}`;
      item = rows[0];
    } else {
      const db = await setupDb();
      item = await db.get('SELECT name, quantity, threshold FROM items WHERE id = ?', id);
    }

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const finalChange = update_type === 'sale' ? -Math.abs(change_amount) : change_amount;
    const newQuantity = item.quantity + finalChange;
    
    if (newQuantity < 0) {
      return res.status(422).json({ success: false, error: 'Stock cannot drop below zero' });
    }

    const report_date = new Date().toISOString().split('T')[0];
    const logId = crypto.randomUUID();

    if (isPostgres()) {
      await sql`
        UPDATE items 
        SET quantity = ${newQuantity}, price_per_unit = ${price_per_unit}, total_amount = ${total_amount}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
      await sql`
        INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, price_per_unit, total_amount, report_date)
        VALUES (${logId}, ${id}, ${item.name}, ${finalChange}, ${update_type}, ${reason}, ${price_per_unit}, ${total_amount}, ${report_date})
      `;
      await sql`INSERT INTO daily_reports (report_id, report_date) VALUES (${crypto.randomUUID()}, ${report_date}) ON CONFLICT (report_date) DO NOTHING`;
    } else {
      const db = await setupDb();
      await db.run('UPDATE items SET quantity = ?, price_per_unit = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        [newQuantity, price_per_unit, total_amount, id]);
      await db.run(
        `INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, price_per_unit, total_amount, report_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, id, item.name, finalChange, update_type, reason, price_per_unit, total_amount, report_date]
      );
      await db.run('INSERT OR IGNORE INTO daily_reports (report_id, report_date) VALUES (?, ?)', [crypto.randomUUID(), report_date]);
    }

    let updatedItem, log;
    if (isPostgres()) {
      updatedItem = (await sql`SELECT * FROM items WHERE id = ${id}`).rows[0];
      log = (await sql`SELECT * FROM stock_logs WHERE id = ${logId}`).rows[0];
    } else {
      const db = await setupDb();
      updatedItem = await db.get('SELECT * FROM items WHERE id = ?', id);
      log = await db.get('SELECT * FROM stock_logs WHERE id = ?', logId);
    }

    updatedItem.is_low_stock = updatedItem.quantity <= updatedItem.threshold;
    res.status(200).json({ success: true, data: { item: updatedItem, log } });
  } catch (err) {
    next(err);
  }
};

exports.getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let item, logs;

    if (isPostgres()) {
      item = (await sql`SELECT * FROM items WHERE id = ${id}`).rows[0];
      if (item) {
        logs = (await sql`SELECT * FROM stock_logs WHERE item_id = ${id} ORDER BY timestamp DESC`).rows;
      }
    } else {
      const db = await setupDb();
      item = await db.get('SELECT * FROM items WHERE id = ?', id);
      if (item) {
        logs = await db.all('SELECT * FROM stock_logs WHERE item_id = ? ORDER BY timestamp DESC', id);
      }
    }

    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
    item.is_low_stock = item.quantity <= item.threshold;
    
    res.status(200).json({ success: true, data: { ...item, logs } });
  } catch (err) {
    next(err);
  }
};

exports.getActivityReports = async (req, res, next) => {
  try {
    let rows;
    if (isPostgres()) {
      // Query stock_logs for distinct dates — daily_reports table is not populated
      rows = (await sql`SELECT DISTINCT report_date FROM stock_logs WHERE report_date IS NOT NULL ORDER BY report_date DESC`).rows;
    } else {
      const db = await setupDb();
      rows = await db.all('SELECT DISTINCT report_date FROM stock_logs WHERE report_date IS NOT NULL ORDER BY report_date DESC');
    }
    res.status(200).json({ success: true, data: rows.map(r => r.report_date) });
  } catch (err) {
    next(err);
  }
};

exports.getReportByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    let rows;
    if (isPostgres()) {
      rows = (await sql`SELECT * FROM stock_logs WHERE report_date = ${date} ORDER BY timestamp DESC`).rows;
    } else {
      const db = await setupDb();
      rows = await db.all('SELECT * FROM stock_logs WHERE report_date = ? ORDER BY timestamp DESC', date);
    }
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

exports.verifyActivityPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    let storedPassword;

    if (isPostgres()) {
      const { rows } = await sql`SELECT value FROM app_settings WHERE key = 'manager_password'`;
      storedPassword = rows[0];
      if (!storedPassword) {
        const hash = crypto.createHash('sha256').update('admin123').digest('hex');
        await sql`INSERT INTO app_settings (key, value) VALUES ('manager_password', ${hash})`;
        storedPassword = { value: hash };
      }
    } else {
      const db = await setupDb();
      storedPassword = await db.get('SELECT value FROM app_settings WHERE key = "manager_password"');
      if (!storedPassword) {
        const hash = crypto.createHash('sha256').update('admin123').digest('hex');
        await db.run('INSERT INTO app_settings (key, value) VALUES ("manager_password", ?)', hash);
        storedPassword = { value: hash };
      }
    }

    const inputHash = crypto.createHash('sha256').update(password).digest('hex');
    if (inputHash === storedPassword.value) {
      res.status(200).json({ success: true, data: { authorized: true }, message: 'Access granted' });
    } else {
      res.status(401).json({ success: false, error: 'Incorrect password' });
    }
  } catch (err) {
    next(err);
  }
};

exports.changeActivityPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    let stored;

    if (isPostgres()) {
      stored = (await sql`SELECT value FROM app_settings WHERE key = 'manager_password'`).rows[0];
    } else {
      const db = await setupDb();
      stored = await db.get('SELECT value FROM app_settings WHERE key = "manager_password"');
    }

    const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (!stored || currentHash !== stored.value) {
      return res.status(401).json({ success: false, error: 'Current password incorrect' });
    }

    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    if (isPostgres()) {
      await sql`UPDATE app_settings SET value = ${newHash} WHERE key = 'manager_password'`;
    } else {
      const db = await setupDb();
      await db.run('UPDATE app_settings SET value = ? WHERE key = "manager_password"', [newHash]);
    }

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
