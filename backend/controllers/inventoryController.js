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
    
    try {
      await db.run(
        `INSERT INTO items (id, name, sku, category, quantity, threshold, price, supplier)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, sku, category, quantity, threshold, price, supplier]
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

exports.updateStock = async (req, res, next) => {
  try {
    const db = await setupDb();
    const { id } = req.params;
    const { change_amount, update_type, reason } = req.body;

    if (!change_amount || !update_type) return res.status(400).json({ success: false, error: 'Missing required fields' });
    if (!['purchase', 'sale', 'adjustment'].includes(update_type)) return res.status(400).json({ success: false, error: 'Invalid update_type' });
    if (update_type === 'adjustment' && !reason) return res.status(400).json({ success: false, error: 'Reason required' });

    await db.run('BEGIN TRANSACTION');

    const item = await db.get('SELECT quantity FROM items WHERE id = ?', id);
    if (!item) {
      await db.run('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const newQuantity = item.quantity + change_amount;
    if (newQuantity < 0) {
      await db.run('ROLLBACK');
      return res.status(422).json({ success: false, error: 'Stock cannot drop below zero' });
    }

    await db.run('UPDATE items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, id]);
    
    const logId = crypto.randomUUID();
    await db.run(
      `INSERT INTO stock_logs (id, item_id, change_amount, update_type, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [logId, id, change_amount, update_type, reason]
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
