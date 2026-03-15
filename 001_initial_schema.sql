-- 001_initial_schema.sql
-- Compatible with PostgreSQL

-- 1. Create items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    threshold INTEGER NOT NULL DEFAULT 0 CHECK (threshold >= 0),
    price DECIMAL(10, 2),
    supplier VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create stock_logs table
CREATE TABLE stock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    change_amount INTEGER NOT NULL,
    update_type VARCHAR(50) NOT NULL, -- e.g., 'purchase', 'sale', 'adjustment'
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_log_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- 3. Create Indexes
CREATE INDEX idx_items_sku ON items (sku);
CREATE INDEX idx_items_category ON items (category);
CREATE INDEX idx_stock_logs_item_id ON stock_logs (item_id);
CREATE INDEX idx_stock_logs_timestamp ON stock_logs (timestamp DESC);

-- 4. Set up an updated_at trigger for items table
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_modtime
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
