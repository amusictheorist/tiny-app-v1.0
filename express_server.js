// Setup
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true}));
app.use(morgan("dev"));
app.use(cookieParser());

// Database and users
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  "8lhz4a": {
    id: "8lhz4a",
    email: "a@a.com",
    password: "1234"
  },
  "8ttlwv": {
    id: "8ttlwv",
    email: "b@b.com",
    password: "5678"
  }
};

// Random string generator
function generateRandomString() {
  let result = Math.random().toString(36).slice(2, 8);
  return result;
};

// getUserByEmail
const getUserByEmail = function(users, email) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// POST /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("You must provide an email and a password!");
  }
  const foundUser = getUserByEmail(users, email);

  if (!foundUser) {
    return res.status(403).send("User not found. Please register to log in!");
  }

  if (foundUser.password !== password) {
    return res.status(403).send("Email or password incorrect. Please try again!");
  }

  const id = foundUser.id;
  console.log(id);

  res.cookie("user_id", id);
  res.redirect("/urls");
});

// POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// POST /register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("You must provide an email and a password");
  }

  const foundUser = getUserByEmail(users, email);

  if (foundUser) {
    return res.status(400).send("Email already exists!");
  }

  const id = generateRandomString();

  const user = { id, email, password };
  users[id] = user;
  console.log(users);
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// POST /urls
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

// POST /urls/:id
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

// POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// GET /register
app.get("/register", (req, res) => {
  res.cookie("user_id", user.id);
  res.render("register", {user: null});
});

// GET /login
app.get("/login", (req, res) => {
  res.cookie("user_id", user.id);
  res.render("login", {user: null});
});

// GET /
app.get("/", (req, res) => {
  res.send("Hello!");
});

// GET /urls
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(400).send("Please log in first!");
  }

  const templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(400).send("Please log in first!");
  }

  res.render("urls_new", {user});
});

// GET /urls/:id
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(400).send("Please log in first!");
  }
    
  const id = req.params.id;
  const templateVars = {
    user,
    id,
    longURL: urlDatabase[id]
  }
  res.render("urls_show", templateVars);
});

// GET /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET /u/:id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found!");
  }
});

// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});