const db = require('../db/connection');

const getUserById = (id) => {
  return db.query('SELECT * FROM users WHERE id = $1', [id])
  .then(data => {
    return data.rows.length > 0 ? data.rows[0] : null;
  });
};

const getUserByEmail = (email) => {
  return db.query('SELECT * FROM users WHERE email = $1', [email])
  .then(data => {
    return data.rows.length > 0 ? data.rows[0] : null;
  });
};

const createUser = (email, password) => {
  return db.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', [email, password])
  .then(data => {
    return data.rows[0].id;
  });
};

module.exports = { getUserById, getUserByEmail, createUser };