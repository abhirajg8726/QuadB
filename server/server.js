// server/server.js
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',          // PostgreSQL username
  host: 'localhost',
  database: 'hodlinfo',       // PostgreSQL database name
  password: 'root',  // PostgreSQL password
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Create table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS tickers (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(255),
    last_traded_price DECIMAL,
    buy_price DECIMAL,
    sell_price DECIMAL,
    volume DECIMAL,
    difference DECIMAL,
    savings DECIMAL
  )
`).catch(err => console.log(err));

// Fetch data from WazirX API and store in PostgreSQL
const fetchAndStoreData = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = Object.values(response.data).slice(0, 10); // Get top 10 tickers

    // Clear existing data
    await pool.query('DELETE FROM tickers');

    // Insert new data
    for (const ticker of tickers) {
      const { name, last, buy, sell, volume, base_unit } = ticker;
      const difference = ((sell - buy) / buy) * 100; // Sample difference calculation
      const savings = difference * 1000;  // Sample savings calculation

      await pool.query(
        'INSERT INTO tickers (platform, last_traded_price, buy_price, sell_price, volume, difference, savings) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, last, buy, sell, volume, difference, savings]
      );
    }
    console.log('Data stored successfully!');
  } catch (err) {
    console.error(err);
  }
};

// Fetch and store data on server start
fetchAndStoreData();

// API route to get the stored data from PostgreSQL
app.get('/api/tickers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickers');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
