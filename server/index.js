import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '313zone_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database!');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};
testConnection();

// === PRODUCTS ROUTES ===
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, price, category, image, stock, isAvailable } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, category, image, stock, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category, image, stock, isAvailable]
    );
    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image, stock, isAvailable } = req.body;
  try {
    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, stock = ?, is_available = ? WHERE id = ?',
      [name, description, price, category, image, stock, isAvailable, id]
    );
    const [updatedProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (updatedProduct.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// === SALES ROUTES ===
app.get('/api/sales', async (req, res) => {
  try {
    const [sales] = await pool.query('SELECT * FROM sales ORDER BY date DESC');
    const salesWithItems = await Promise.all(
      sales.map(async (sale) => {
        const [items] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [sale.id]);
        return {
          ...sale,
          items: items.map(item => ({
            productId: item.product_id,
            name: item.product_name,
            price: item.price,
            quantity: item.quantity
          }))
        };
      })
    );
    res.json(salesWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

app.post('/api/sales', async (req, res) => {
  const { items, total, paymentMethod, date } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [saleResult] = await connection.query(
      'INSERT INTO sales (total, payment_method, date) VALUES (?, ?, ?)',
      [total, paymentMethod, date]
    );
    const saleId = saleResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.productId, item.name, item.price, item.quantity]
      );
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    await connection.commit();
    const [newSale] = await connection.query('SELECT * FROM sales WHERE id = ?', [saleId]);
    const [saleItems] = await connection.query('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);

    const completeSale = {
      ...newSale[0],
      items: saleItems.map(item => ({
        productId: item.product_id,
        name: item.product_name,
        price: item.price,
        quantity: item.quantity
      }))
    };
    res.status(201).json(completeSale);
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to create sale' });
  } finally {
    connection.release();
  }
});

// CERRAR CAJA
app.delete('/api/sales', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query('DELETE FROM sale_items');
    const [result] = await connection.query('DELETE FROM sales');

    await connection.commit();
    connection.release();

    res.json({ message: 'Caja cerrada y ventas eliminadas', deleted: result.affectedRows });
  } catch (error) {
    console.error('Error al cerrar la caja:', error);
    res.status(500).json({ error: 'No se pudo cerrar la caja' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
