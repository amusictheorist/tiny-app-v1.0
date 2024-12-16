const { Pool } = require('pg');

require('dotenv').config();

const dbParams = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

const db = new Pool(dbParams);

// Test the connection
db.connect()
  .then(() => console.log('Database connected successfully!'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = db;
