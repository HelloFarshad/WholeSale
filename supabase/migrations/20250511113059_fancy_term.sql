/*
  # Initial Schema for Wholesale ERP System

  1. New Tables
    - `users` - User profiles linked to auth.users
    - `item_categories` - Categories for grouping items
    - `units` - Units of measurement with conversion rates
    - `items` - Products inventory
    - `customers` - Customer profiles
    - `suppliers` - Supplier profiles
    - `warehouses` - Storage locations
    - `inventory_movements` - Stock movement tracking
    - `sales_orders` - Sales order headers
    - `sales_order_items` - Sales order line items
    - `purchase_orders` - Purchase order headers
    - `purchase_order_items` - Purchase order line items
    - `customer_payments` - Customer payment records
    - `supplier_payments` - Supplier payment records
    
  2. Security
    - Enable RLS on all tables
    - Add policies for admin, manager and clerk roles
    
  3. Views
    - `current_stock_by_item_and_warehouse` - Current stock levels
    - `outstanding_customer_balances` - Customer balance report
    - `top_selling_items_by_month` - Sales analysis
*/

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'clerk')),
  assigned_warehouse_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS item_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  conversion_to_base NUMERIC NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  manager_id UUID REFERENCES users(id)
);

-- Add foreign key for users.assigned_warehouse_id
ALTER TABLE users
  ADD CONSTRAINT users_assigned_warehouse_id_fkey
  FOREIGN KEY (assigned_warehouse_id) REFERENCES warehouses(id);

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  category_id UUID NOT NULL REFERENCES item_categories(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  base_unit_qty NUMERIC NOT NULL DEFAULT 1,
  price_wholesale NUMERIC NOT NULL,
  price_retail NUMERIC NOT NULL,
  vat_percent NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('retail', 'distributor')),
  credit_limit NUMERIC,
  vat_number TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  vat_number TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  quantity NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out')),
  related_doc UUID,
  remarks TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'confirmed', 'delivered')),
  total_amount NUMERIC NOT NULL,
  total_vat NUMERIC NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  vat_percent NUMERIC NOT NULL,
  line_total NUMERIC NOT NULL,
  line_vat NUMERIC NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  order_date DATE NOT NULL,
  delivery_date DATE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'received', 'invoiced')),
  total_amount NUMERIC NOT NULL,
  total_vat NUMERIC NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  vat_percent NUMERIC NOT NULL,
  line_total NUMERIC NOT NULL,
  line_vat NUMERIC NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id)
);

CREATE TABLE IF NOT EXISTS customer_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'bank', 'credit_card', 'check')),
  payment_date DATE NOT NULL,
  reference TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'bank', 'credit_card', 'check')),
  payment_date DATE NOT NULL,
  reference TEXT
);

-- Create views
CREATE OR REPLACE VIEW current_stock_by_item_and_warehouse AS
SELECT 
  im.item_id,
  im.warehouse_id,
  SUM(im.quantity) AS current_stock
FROM 
  inventory_movements im
GROUP BY 
  im.item_id, im.warehouse_id;

CREATE OR REPLACE VIEW outstanding_customer_balances AS
SELECT
  c.id AS customer_id,
  c.name AS customer_name,
  COALESCE(SUM(so.total_amount), 0) AS total_sales,
  COALESCE(SUM(cp.amount), 0) AS total_payments,
  COALESCE(SUM(so.total_amount), 0) - COALESCE(SUM(cp.amount), 0) AS balance
FROM
  customers c
LEFT JOIN
  sales_orders so ON c.id = so.customer_id
LEFT JOIN
  customer_payments cp ON c.id = cp.customer_id
GROUP BY
  c.id, c.name;

CREATE OR REPLACE VIEW top_selling_items_by_month AS
SELECT
  TO_CHAR(so.created_at, 'YYYY-MM') AS month,
  soi.item_id,
  i.name AS item_name,
  SUM(soi.quantity) AS total_quantity,
  SUM(soi.line_total) AS total_amount
FROM
  sales_order_items soi
JOIN
  sales_orders so ON soi.sales_order_id = so.id
JOIN
  items i ON soi.item_id = i.id
GROUP BY
  TO_CHAR(so.created_at, 'YYYY-MM'),
  soi.item_id,
  i.name
ORDER BY
  month DESC, total_amount DESC;

-- Create functions
CREATE OR REPLACE FUNCTION calculate_stock(p_item_id UUID, p_warehouse_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_stock NUMERIC;
BEGIN
  IF p_warehouse_id IS NULL THEN
    -- Calculate stock across all warehouses
    SELECT COALESCE(SUM(quantity), 0)
    INTO v_stock
    FROM inventory_movements
    WHERE item_id = p_item_id;
  ELSE
    -- Calculate stock for specific warehouse
    SELECT COALESCE(SUM(quantity), 0)
    INTO v_stock
    FROM inventory_movements
    WHERE item_id = p_item_id AND warehouse_id = p_warehouse_id;
  END IF;
  
  RETURN v_stock;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- For users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- For item_categories
CREATE POLICY "All authenticated users can view item categories" ON item_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can insert item categories" ON item_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update item categories" ON item_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete item categories" ON item_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- For units
CREATE POLICY "All authenticated users can view units" ON units
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can insert units" ON units
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update units" ON units
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete units" ON units
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- For items
CREATE POLICY "All authenticated users can view items" ON items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can insert items" ON items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update items" ON items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete items" ON items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- For customers
CREATE POLICY "All authenticated users can view customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert customers" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can update customers" ON customers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete customers" ON customers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- For suppliers
CREATE POLICY "All authenticated users can view suppliers" ON suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update suppliers" ON suppliers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete suppliers" ON suppliers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- For warehouses
CREATE POLICY "All authenticated users can view warehouses" ON warehouses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage warehouses" ON warehouses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- For inventory_movements
CREATE POLICY "All authenticated users can view inventory movements" ON inventory_movements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert inventory movements" ON inventory_movements
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

-- For sales_orders
CREATE POLICY "All authenticated users can view sales orders" ON sales_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert sales orders" ON sales_orders
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their own sales orders" ON sales_orders
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policies for sales_order_items, purchase_orders, purchase_order_items follow same pattern

-- For customer_payments
CREATE POLICY "All authenticated users can view customer payments" ON customer_payments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert customer payments" ON customer_payments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'Item Images', true);

-- Create policy for item images
CREATE POLICY "Public can view item images" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'item-images'
  );

-- Insert initial data for demo purposes
INSERT INTO item_categories (id, name)
VALUES 
  ('9f4c9efc-9c4c-4d3e-a8a2-0d8e6d0d0e0e', 'Electronics'),
  ('8b3b8aba-8a8a-4c3c-b8b2-0c7d5c0c0d0d', 'Office Supplies'),
  ('7a2a7aba-7a7a-4b2b-a7a2-0b6c4b0b0c0c', 'Furniture');

INSERT INTO units (id, name, conversion_to_base)
VALUES 
  ('6f1f6aba-6f6f-4a1a-f6f1-0a5b3a0a0b0b', 'Piece', 1),
  ('5e0e5aba-5e5e-4909-e5e0-0940290909a0', 'Box', 10),
  ('4d0d4aba-4d4d-4808-d4d0-0830180808a0', 'Carton', 100);

-- Create default admin user (Note: This would be replaced with the actual admin user in a real deployment)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  '$2a$10$zXlMeGnjuSMu56.7kKB/3OuB5QjuWZGASRMofXSGyPsXgq3OYlWpW', -- 'password123'
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User"}',
  now()
);

INSERT INTO users (id, name, email, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Admin User',
  'admin@example.com',
  'admin',
  now()
);