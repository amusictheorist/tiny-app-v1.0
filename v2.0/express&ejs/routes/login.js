const express = require('express');
const router = express.Router();
const { getUserByEmail } = require('../queries/user_queries');

// GET /login
router.get('/', (req, res) => {
  const templateVars = { user: null }
  res.render('login', templateVars);
});

// POST /login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(403).send('Invalid email or password');
    }
    
    req.session.userId = user.id;
    res.redirect('/urls');
  } catch (error) {
    console.error('Error during login: ', error.message);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;