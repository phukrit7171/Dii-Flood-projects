const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '672110154'
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL successfully");
});

app.get("/", (req, res) => {
    res.send("Welcome to flood api");
});

// Read all products
app.get("/products", (req, res) => {
    const query = "SELECT * FROM products";
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching products:", err);
            res.status(500).json({ error: "Error fetching products" });
        } else {
            res.json(results);
        }
    });
});

// Create a new product
app.post('/products', (req, res) => {
    const { productName, price, qty } = req.body;
    const query = "INSERT INTO products (productName, price, qty) VALUES (?, ?, ?)";
    connection.query(query, [productName, price, qty], (err, results) => {
        if (err) {
            console.error('Error creating product: ', err);
            return res.status(500).json({ message: 'Error creating product' });
        }
        res.status(201).json({ id: results.insertId, productName, price, qty });
    });
});

// Read a single product
app.get("/products/:id", (req, res) => {
    const id = req.params.id;
    const query = "SELECT * FROM products WHERE id = ?";
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error fetching product:", err);
            res.status(500).json({ error: "Error fetching product" });
        } else if (results.length === 0) {
            res.status(404).json({ error: "Product not found" });
        } else {
            res.json(results[0]);
        }
    });
});

// Update a product
app.put('/products/:id', (req, res) => {
    const id = req.params.id;
    const { productName, price, qty } = req.body;
    const query = "UPDATE products SET productName = ?, price = ?, qty = ? WHERE id = ?";
    connection.query(query, [productName, price, qty, id], (err, results) => {
        if (err) {
            console.error('Error updating product: ', err);
            return res.status(500).json({ message: 'Error creating product' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ id, productName, price, qty });
    });
});

// Delete a product
app.delete('/products/:id', (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM products WHERE id = ?";
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting product: ', err);
            return res.status(500).json({ message: 'Error deleting product' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});