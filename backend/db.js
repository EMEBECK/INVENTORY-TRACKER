const { sql } = require('@vercel/postgres');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

/**
 * setupDb initializes the database tables if they don't exist.
 * Supports Vercel Postgres in production and SQLite in development.
 */
async function setupDb() {
  if (process.env.POSTGRES_URL) {
    try {
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
          item_id TEXT NOT NULL,
          item_name TEXT NOT NULL,
          change_amount INTEGER NOT NULL,
          update_type TEXT NOT NULL,
          reason TEXT,
          price_per_unit REAL,
          total_amount REAL,
          report_date TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS daily_reports (
          report_id TEXT PRIMARY KEY,
          report_date TEXT NOT NULL UNIQUE
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `;
      return { sql };
    } catch (error) {
      console.error('Postgres setup error:', error);
      throw error;
    }
  } else {
    // Fallback to SQLite for local development
    if (dbInstance) return dbInstance;
    dbInstance = await open({
      filename: path.join(__dirname, 'inventory.sqlite'),
      driver: sqlite3.Database
    });
    
    await dbInstance.exec(`
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

      CREATE TABLE IF NOT EXISTS stock_logs (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        change_amount INTEGER NOT NULL,
        update_type TEXT NOT NULL,
        reason TEXT,
        price_per_unit REAL,
        total_amount REAL,
        report_date TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_reports (
        report_id TEXT PRIMARY KEY,
        report_date TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    
    return dbInstance;
  }
}

module.exports = setupDb;
