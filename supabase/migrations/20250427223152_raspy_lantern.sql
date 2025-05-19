/*
  # 313 ZONE Bar Management System Schema

  1. New Tables
    - products: Store product information and inventory
    - sales: Track sales transactions
    - sale_items: Store individual items in each sale

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10, 2) NOT NULL,
  category text NOT NULL,
  image text,
  stock integer NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total decimal(10, 2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'NEQUI')),
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_name text NOT NULL,
  price decimal(10, 2) NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Sample products data
INSERT INTO products (name, description, price, category, image, stock, is_available) VALUES
('Gin Tonic', 'Classic cocktail with gin and tonic water', 12.99, 'Cocktails', 'https://images.pexels.com/photos/3407782/pexels-photo-3407782.jpeg', 100, true),
('Mojito', 'Refreshing cocktail with rum, mint, and lime', 10.99, 'Cocktails', 'https://images.pexels.com/photos/4021983/pexels-photo-4021983.jpeg', 100, true),
('Margarita', 'Tequila-based cocktail with lime and salt', 11.99, 'Cocktails', 'https://images.pexels.com/photos/5947019/pexels-photo-5947019.jpeg', 100, true),
('Old Fashioned', 'Classic whiskey cocktail with bitters and sugar', 13.99, 'Cocktails', 'https://images.pexels.com/photos/5379526/pexels-photo-5379526.jpeg', 100, true),
('Heineken', 'Premium Dutch lager beer', 6.99, 'Beer', 'https://images.pexels.com/photos/1672304/pexels-photo-1672304.jpeg', 200, true),
('Corona', 'Mexican pale lager with lime', 6.99, 'Beer', 'https://images.pexels.com/photos/1672304/pexels-photo-1672304.jpeg', 200, true),
('Cabernet Sauvignon', 'Full-bodied red wine', 9.99, 'Wine', 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg', 50, true),
('Chardonnay', 'White wine with buttery notes', 8.99, 'Wine', 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg', 50, true),
('Jack Daniels', 'Tennessee whiskey', 7.99, 'Spirits', 'https://images.pexels.com/photos/339696/pexels-photo-339696.jpeg', 30, true),
('Grey Goose Vodka', 'Premium French vodka', 9.99, 'Spirits', 'https://images.pexels.com/photos/339696/pexels-photo-339696.jpeg', 30, true),
('Nachos', 'Tortilla chips with cheese and jalapeños', 8.99, 'Food', 'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg', 50, true),
('Chicken Wings', 'Spicy buffalo wings with blue cheese dip', 11.99, 'Food', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 50, true);