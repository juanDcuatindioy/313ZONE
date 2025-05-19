-- 313 ZONE Bar Management System Database Schema

-- Drop database if exists
DROP DATABASE IF EXISTS 313zone_db;

-- Create database
CREATE DATABASE 313zone_db;

-- Use database
USE 313zone_db;

-- Products table
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image VARCHAR(255),
  stock INT NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  total DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'NEQUI') NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sale Items table
CREATE TABLE sale_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

-- Sample products data
INSERT INTO products (name, description, price, category, image, stock, is_available) VALUES
('Gin Tonic', 'Classic cocktail with gin and tonic water', 12.99, 'Cocktails', 'https://images.pexels.com/photos/3407782/pexels-photo-3407782.jpeg', 100, TRUE),
('Mojito', 'Refreshing cocktail with rum, mint, and lime', 10.99, 'Cocktails', 'https://images.pexels.com/photos/4021983/pexels-photo-4021983.jpeg', 100, TRUE),
('Margarita', 'Tequila-based cocktail with lime and salt', 11.99, 'Cocktails', 'https://images.pexels.com/photos/5947019/pexels-photo-5947019.jpeg', 100, TRUE),
('Old Fashioned', 'Classic whiskey cocktail with bitters and sugar', 13.99, 'Cocktails', 'https://images.pexels.com/photos/5379526/pexels-photo-5379526.jpeg', 100, TRUE),
('Heineken', 'Premium Dutch lager beer', 6.99, 'Beer', 'https://images.pexels.com/photos/1672304/pexels-photo-1672304.jpeg', 200, TRUE),
('Corona', 'Mexican pale lager with lime', 6.99, 'Beer', 'https://images.pexels.com/photos/1672304/pexels-photo-1672304.jpeg', 200, TRUE),
('Cabernet Sauvignon', 'Full-bodied red wine', 9.99, 'Wine', 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg', 50, TRUE),
('Chardonnay', 'White wine with buttery notes', 8.99, 'Wine', 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg', 50, TRUE),
('Jack Daniels', 'Tennessee whiskey', 7.99, 'Spirits', 'https://images.pexels.com/photos/339696/pexels-photo-339696.jpeg', 30, TRUE),
('Grey Goose Vodka', 'Premium French vodka', 9.99, 'Spirits', 'https://images.pexels.com/photos/339696/pexels-photo-339696.jpeg', 30, TRUE),
('Nachos', 'Tortilla chips with cheese and jalapeños', 8.99, 'Food', 'https://images.pexels.com/photos/5792329/pexels-photo-5792329.jpeg', 50, TRUE),
('Chicken Wings', 'Spicy buffalo wings with blue cheese dip', 11.99, 'Food', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 50, TRUE);