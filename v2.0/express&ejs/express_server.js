// Setup
require('dotenv').config();
const express = require('express');
const router = express.Router();
const session = require('express-session');
const morgan = require('morgan');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

// Middlewware
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Routes
const urlsRouter = require('./routes/urls');
const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register');
app.use('/', urlsRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);

// Starting the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});