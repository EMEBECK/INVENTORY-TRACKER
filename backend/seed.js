const setupDb = require('./db');
const crypto = require('crypto');

const mockData = [
  { 
    name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', quantity: 150, threshold: 20, price: 29.99, supplier: 'TechSupplies Inc',
    date_purchased: '2026-01-10', quantity_purchased: 200, purchase_amount: 4000.00, supplier_name: 'TechSupplies Inc', supplier_contact: 'sales@techsupplies.com', supplier_address: '123 Tech Lane, Silicon Valley', notes: 'Best seller for Q1'
  },
  { 
    name: 'Mechanical Keyboard (Cherry Red)', sku: 'MK-002', category: 'Electronics', quantity: 5, threshold: 10, price: 89.99, supplier: 'TechSupplies Inc',
    date_purchased: '2026-02-15', quantity_purchased: 50, purchase_amount: 3500.00, supplier_name: 'TechSupplies Inc', supplier_contact: 'support@techsupplies.com', supplier_address: '123 Tech Lane, Silicon Valley', notes: 'Urgent restock needed'
  }, 
  { 
    name: 'USB-C Braided Cable 2m', sku: 'UC-003', category: 'Accessories', quantity: 0, threshold: 50, price: 12.99, supplier: 'CablesCo',
    date_purchased: '2026-03-01', quantity_purchased: 100, purchase_amount: 800.00, supplier_name: 'CablesCo', supplier_contact: 'info@cablesco.com', supplier_address: '456 Connection Way, New York', notes: 'Out of stock, wait for supplier'
  }, 
  { 
    name: 'Ergonomic Mesh Chair', sku: 'EC-100', category: 'Furniture', quantity: 12, threshold: 5, price: 199.99, supplier: 'OfficeWorks',
    date_purchased: '2025-12-20', quantity_purchased: 20, purchase_amount: 3000.00, supplier_name: 'OfficeWorks', supplier_contact: 'billing@officeworks.com', supplier_address: '789 Comfort Blvd, Chicago', notes: 'Premium stock'
  },
  { 
    name: 'Motorized Standing Desk', sku: 'SD-101', category: 'Furniture', quantity: 8, threshold: 10, price: 399.99, supplier: 'OfficeWorks',
    date_purchased: '2026-01-05', quantity_purchased: 10, purchase_amount: 3500.00, supplier_name: 'OfficeWorks', supplier_contact: 'billing@officeworks.com', supplier_address: '789 Comfort Blvd, Chicago'
  }, 
  { name: 'Dual Monitor Arm', sku: 'MA-004', category: 'Accessories', quantity: 45, threshold: 15, price: 45.00, supplier: 'TechSupplies Inc' },
  { name: 'Noise Cancelling Headphones V2', sku: 'NCH-005', category: 'Electronics', quantity: 22, threshold: 20, price: 249.99, supplier: 'AudioTech' },
  { name: 'HD Webcam 1080p', sku: 'WC-006', category: 'Electronics', quantity: 0, threshold: 10, price: 59.99, supplier: 'TechSupplies Inc' }, 
  { name: 'Portable Bluetooth Speaker', sku: 'BS-007', category: 'Electronics', quantity: 30, threshold: 15, price: 79.99, supplier: 'AudioTech' },
  { name: 'Extended Leather Desk Mat', sku: 'DM-008', category: 'Accessories', quantity: 100, threshold: 30, price: 19.99, supplier: 'OfficeWorks' },
];

async function seed() {
  try {
    const db = await setupDb();
    
    console.log('Clearing existing data...');
    await db.run('DELETE FROM stock_logs');
    await db.run('DELETE FROM items');
    
    console.log('Inserting mock data...');
    for (const item of mockData) {
      const id = crypto.randomUUID();
      await db.run(
        `INSERT INTO items (
          id, name, sku, category, quantity, threshold, price, supplier,
          date_purchased, quantity_purchased, purchase_amount, supplier_name, supplier_contact, supplier_address, notes
        )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, item.name, item.sku, item.category, item.quantity, item.threshold, item.price, item.supplier,
          item.date_purchased || null, item.quantity_purchased || null, item.purchase_amount || null, 
          item.supplier_name || null, item.supplier_contact || null, item.supplier_address || null, item.notes || null
        ]
      );
      
      // Add a dummy stock log to show history possibility
      const logId = crypto.randomUUID();
      await db.run(
        `INSERT INTO stock_logs (id, item_id, change_amount, update_type, reason)
         VALUES (?, ?, ?, ?, ?)`,
        [logId, id, item.quantity, 'adjustment', 'Initial stock seed']
      );
      
      console.log(`Added: ${item.name} (${item.quantity} in stock, threshold: ${item.threshold})`);
    }
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
