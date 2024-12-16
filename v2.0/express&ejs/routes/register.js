const express = require('express');
const router = express.Router();
const { getUserByEmail, createUser } = require('../queries/user_queries');

// GET /register
router.get('/', (req, res) => {
  const templateVars = { user: null };
  res.render('register', templateVars);
});

// POST /register
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('You must provide an email and a password!');
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).send('User is already registered!');
    }

    const newUserId = await createUser(email, password);

    res.redirect('/urls');
  } catch (error) {
    console.error('Error creating user: ', error.message);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;