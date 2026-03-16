const setupDb = require('../db');
const crypto = require('crypto');

exports.getInventory = async (req, res, next) => {
  try {
    const db = await setupDb();
    const { status, search } = req.query;
    
    let queryOptions = 'SELECT * FROM items';
    let queryParams = [];
    
    if (search) {
      queryOptions += ' WHERE name LIKE ? OR sku LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    queryOptions += ' ORDER BY created_at DESC';

    const rows = await db.all(queryOptions, ...queryParams);
    
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
    const db = await setupDb();
    const rows = await db.all('SELECT DISTINCT category FROM items WHERE category IS NOT NULL AND category != ""');
    const categories = rows.map(r => r.category);
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const db = await setupDb();
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

      // Log the addition
      await db.run(
        `INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, price_per_unit, total_amount, report_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), id, name, quantity, 'Add Item', 'Initial stock', price_per_unit, total_amount, report_date]
      );
    } catch(err) {
      if (err.message.includes('UNIQUE constraint failed: items.sku')) {
        return res.status(400).json({ success: false, error: 'SKU already exists' });
      }
      throw err;
    }

    const newItem = await db.get('SELECT * FROM items WHERE id = ?', id);
    newItem.is_low_stock = newItem.quantity <= newItem.threshold;

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const db = await setupDb();
    const { id } = req.params;
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Item name cannot be empty' });
    }

    await db.run(
      'UPDATE items SET name = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, category, id]
    );

    // Dynamic logging for edits would be better but keeping it simple for now
    const report_date = new Date().toISOString().split('T')[0];
    await db.run(
      `INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, report_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), id, name, 0, 'Edit Item', `Updated name/category`, report_date]
    );

    const updatedItem = await db.get('SELECT * FROM items WHERE id = ?', id);
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
    const db = await setupDb();
    const { id } = req.params;
    const { change_amount, update_type, reason, price_per_unit, total_amount } = req.body;

    if (!change_amount || !update_type) return res.status(400).json({ success: false, error: 'Missing required fields' });
    if (!['purchase', 'sale', 'adjustment'].includes(update_type)) return res.status(400).json({ success: false, error: 'Invalid update_type' });
    if (update_type === 'adjustment' && !reason) return res.status(400).json({ success: false, error: 'Reason required' });
    if (Math.abs(change_amount) === 0) return res.status(400).json({ success: false, error: 'Quantity must be non-zero' });
    if (price_per_unit !== undefined && price_per_unit < 0) return res.status(400).json({ success: false, error: 'Price per unit cannot be negative' });

    await db.run('BEGIN TRANSACTION');

    const item = await db.get('SELECT quantity FROM items WHERE id = ?', id);
    if (!item) {
      await db.run('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const finalChange = update_type === 'sale' ? -Math.abs(change_amount) : change_amount;
    const newQuantity = item.quantity + finalChange;
    
    if (newQuantity < 0) {
      await db.run('ROLLBACK');
      return res.status(422).json({ success: false, error: 'Stock cannot drop below zero' });
    }

    const report_date = new Date().toISOString().split('T')[0];
    await db.run('UPDATE items SET quantity = ?, price_per_unit = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [newQuantity, price_per_unit, total_amount, id]);
    
    const logId = crypto.randomUUID();
    await db.run(
      `INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, price_per_unit, total_amount, report_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, id, item.name, finalChange, update_type, reason, price_per_unit, total_amount, report_date]
    );

    await db.run('COMMIT');

    const updatedItem = await db.get('SELECT * FROM items WHERE id = ?', id);
    updatedItem.is_low_stock = updatedItem.quantity <= updatedItem.threshold;
    const log = await db.get('SELECT * FROM stock_logs WHERE id = ?', logId);

    res.status(200).json({ success: true, data: { item: updatedItem, log } });
  } catch (err) {
    const db = await setupDb();
    await db.run('ROLLBACK').catch(() => {});
    next(err);
  }
};

exports.getItemById = async (req, res, next) => {
  try {
    const db = await setupDb();
    const { id } = req.params;
    
    const item = await db.get('SELECT * FROM items WHERE id = ?', id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
    
    item.is_low_stock = item.quantity <= item.threshold;
    
    const logs = await db.all('SELECT * FROM stock_logs WHERE item_id = ? ORDER BY timestamp DESC', id);
    
    res.status(200).json({ success: true, data: { ...item, logs } });
  } catch (err) {
    next(err);
  }
};

exports.updateItemMetadata = async (req, res, next) => {
  try {
    const db = await setupDb();
    const { id } = req.params;
    const { 
      name, category, threshold, price, supplier,
      date_purchased, quantity_purchased, purchase_amount,
      supplier_name, supplier_contact, supplier_address, notes
    } = req.body;

    const existing = await db.get('SELECT id FROM items WHERE id = ?', id);
    if (!existing) return res.status(404).json({ success: false, error: 'Item not found' });

    await db.run(
      `UPDATE items SET 
        name = ?, category = ?, threshold = ?, price = ?, supplier = ?,
        date_purchased = ?, quantity_purchased = ?, purchase_amount = ?,
        supplier_name = ?, supplier_contact = ?, supplier_address = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name, category, threshold, price, supplier,
        date_purchased, quantity_purchased, purchase_amount,
        supplier_name, supplier_contact, supplier_address, notes,
        id
      ]
    );

    const report_date = new Date().toISOString().split('T')[0];
    await db.run(
      `INSERT INTO stock_logs (id, item_id, item_name, change_amount, update_type, reason, report_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), id, name, 0, 'Edit Item', 'Updated metadata', report_date]
    );

    const updated = await db.get('SELECT * FROM items WHERE id = ?', id);
    updated.is_low_stock = updated.quantity <= updated.threshold;

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.getActivityReports = async (req, res, next) => {
  try {
    const db = await setupDb();
    const rows = await db.all('SELECT DISTINCT report_date FROM stock_logs WHERE report_date IS NOT NULL ORDER BY report_date DESC');
    res.status(200).json({ success: true, data: rows.map(r => r.report_date) });
  } catch (err) {
    next(err);
  }
};

exports.getReportByDate = async (req, res, next) => {
  try {
    const db = await setupDb();
    const { date } = req.params;
    const rows = await db.all('SELECT * FROM stock_logs WHERE report_date = ? ORDER BY timestamp DESC', date);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

exports.verifyActivityPassword = async (req, res, next) => {
  try {
    const db = await setupDb();
    const { password } = req.body;
    
    // For this MVP improvement, we'll store a simple hashed password if not exists
    // Default password 'admin123'
    let storedPassword = await db.get('SELECT value FROM app_settings WHERE key = "manager_password"');
    
    if (!storedPassword) {
      const hash = crypto.createHash('sha256').update('admin123').digest('hex');
      await db.run('INSERT INTO app_settings (key, value) VALUES ("manager_password", ?)', hash);
      storedPassword = { value: hash };
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
    const db = await setupDb();
    const { currentPassword, newPassword } = req.body;

    const stored = await db.get('SELECT value FROM app_settings WHERE key = "manager_password"');
    const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');

    if (!stored || currentHash !== stored.value) {
      return res.status(401).json({ success: false, error: 'Current password incorrect' });
    }

    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    await db.run('UPDATE app_settings SET value = ? WHERE key = "manager_password"', [newHash]);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
