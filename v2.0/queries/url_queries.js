const db = require('../db/connection');

const getUrlsByUser = (userId) => {
  return db.query('SELECT * FROM urls WHERE user_id = $1', [userId])
  .then(data => {
    return data.rows;
  });
};

const getSpecificUrl = (urlId, userId) => {
  return db.query('SELECT * FROM urls WHERE id = $1 AND user_id = $2', [urlId, userId])
  .then(data => {
    return data.rows[0];
  });
};

const getUrlByShortUrl = (shortURL) => {
  return db.query('SELECT longurl FROM urls WHERE shorturl = $1', [shortURL])
  .then(data => {
    return data.rows.length > 0 ? data.rows[0] : null;
  });
};

const updateSpecificUrl = (longURL, urlId) => {
  return db.query('UPDATE urls SET longurl = $1 WHERE id = $2', [longURL, urlId]);
};

const deleteUrl = (urlId) => {
  return db.query('DELETE FROM urls WHERE id = $1', [urlId]);
};

const createUrl = (shortURL, longURL, userId) => {
  return db.query('INSERT INTO urls (shorturl, longurl, user_id) VALUES ($1, $2, $3)', [shortURL, longURL, userId])
  .then(data => {
    return data.rows[0];
  });
};

module.exports = { getUrlsByUser, getSpecificUrl, getUrlByShortUrl, updateSpecificUrl, deleteUrl, createUrl };