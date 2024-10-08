const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const winston = require('winston'); // Add winston for logging

const app = express();
const port = 3000;

// Setup logger using winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'app.log' }) // Log to file
  ],
});

// Create Logging middleware
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

// Middleware
app.use(loggingMiddleware);
app.use(express.json());
app.use(cors());

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'flood_dii'
});

connection.connect((err) => {
  if (err) {
    logger.error('Error connecting to MySQL:', err);
    return;
  }
  logger.info('Connected to MySQL database');
});

// Signup route
app.post('/signup', (req, res) => {
  const { username, password, name, address, telephone, help } = req.body;

  // Check if user already exists
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      logger.error('Error checking existing user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        logger.error('Error hashing password:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Insert new user
      const newUser = { username, password: hashedPassword, name, address, telephone, help };
      connection.query('INSERT INTO users SET ?', newUser, (err, result) => {
        if (err) {
          logger.error('Error creating new user:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(201).json({ message: 'User created successfully' });
      });
    });
  });
});

// Sign-in route
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  // Find user
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      logger.error('Error finding user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    // Compare passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        logger.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

      res.json({ message: 'Sign-in successful', token });
    });
  });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Update user information route
app.put('/user', verifyToken, (req, res) => {
  const { password, name, address, telephone, help } = req.body;
  const userId = req.userId;

  let updates = {};
  let updatePromises = [];

  if (password) {
    updatePromises.push(
      new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) reject(err);
          updates.password = hashedPassword;
          resolve();
        });
      })
    );
  }
  if (name) updates.name = name;
  if (address) updates.address = address;
  if (telephone) updates.telephone = telephone;
  if (help !== undefined) updates.help = help;

  Promise.all(updatePromises)
    .then(() => {
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      connection.query('UPDATE users SET ? WHERE id = ?', [updates, userId], (err, result) => {
        if (err) {
          logger.error('Error updating user information:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'User information updated successfully' });
      });
    })
    .catch(err => {
      logger.error('Error updating user information:', err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// Delete account route
app.delete('/user', verifyToken, (req, res) => {
  const userId = req.userId;

  connection.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      logger.error('Error deleting user account:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json({ message: 'Account deleted successfully' });
  });
});

// Get all users who need help
app.get('/users/need-help',  (req, res) => {
  connection.query('SELECT id, name, address, telephone FROM users WHERE help = TRUE', (err, results) => {
    if (err) {
      logger.error('Error fetching users who need help:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json(results);
  });
});

// Get user information route
app.get('/user', verifyToken, (req, res) => {
  const userId = req.userId;

  connection.query('SELECT id, username, name, address, telephone, help FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      logger.error('Error fetching user information:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    res.json(user);
  });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});