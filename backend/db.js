const { sql } = require('@vercel/postgres');

/**
 * setupDb initializes the database tables if they don't exist.
 * In Vercel Postgres, we use the 'sql' tagged template literal.
 */
async function setupDb() {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT NOT NULL UNIQUE,
        category TEXT,
        quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
        threshold INTEGER NOT NULL DEFAULT 0 CHECK (threshold >= 0),
        price REAL,
        price_per_unit REAL,
        total_amount REAL,
        supplier TEXT,
        date_purchased TEXT,
        quantity_purchased INTEGER,
        purchase_amount REAL,
        supplier_name TEXT,
        supplier_contact TEXT,
        supplier_address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS stock_logs (
        id TEXT PRIMARY KEY,
        item_id TEXT,
        item_name TEXT,
        change_amount INTEGER NOT NULL,
        update_type TEXT NOT NULL,
        reason TEXT,
        price_per_unit REAL,
        total_amount REAL,
        report_date TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS daily_reports (
        report_id TEXT PRIMARY KEY,
        report_date TEXT UNIQUE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `;

    console.log('Database tables verified/created successfully.');
    return { sql }; // Return an object that exposes the sql function
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

module.exports = setupDb;
