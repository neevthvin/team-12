require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
// connection settings from .env file
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
// connection pool settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;