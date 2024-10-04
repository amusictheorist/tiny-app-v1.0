// Setup
const { getUserByEmail, generateRandomString } = require("./helpers");
const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true}));
app.use(morgan("dev"));
app.use(cookieSession({ name: "session", keys: ["dodecaphony"] }));

const urlsForUser = function(id) {
  const userURLs = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userURLs[urlID] = urlDatabase[urlID];
    }
  }
  return userURLs;
};

// Database and users
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const users = {
  "8lhz4a": {
    id: "8lhz4a",
    email: "a@a.com",
    password: bcrypt.hashSync("1234", 10)
  },
  "8ttlwv": {
    id: "8ttlwv",
    email: "b@b.com",
    password: bcrypt.hashSync("5678", 10)
  }
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

  if (bcrypt.compareSync(password, foundUser.password) === false) {
    return res.status(403).send("Email or password incorrect. Please try again!");
  }

  const id = foundUser.id;

  req.session.user_id = id;
  res.redirect("/urls");
});

// POST /logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

// POST /register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("You must provide an email and a password!");
  }

  const foundUser = getUserByEmail(users, email);

  if (foundUser) {
    return res.status(400).send("Email already exists!");
  }

  const id = generateRandomString();

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id, email, password: hashedPassword };
  users[id] = user;
  req.session.user_id = id;
  res.redirect("/urls");
});

// POST /urls
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send("You must be logged in to shorten a URL!");
  }
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = { longURL, userID };
  res.redirect(`/urls/${id}`);
});

// POST /urls/:id
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("Please log in first!");
  }
  const url = urlDatabase[req.params.id];
  if (!url || url.userID !== userID) {
    return res.status(403).send("You do not have permission to edit this URL!");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("Please log in first!");
  }
  const url = urlDatabase[req.params.id];
  if (!url || url.userID !== userID) {
    return res.status(403).send("You do not have permission to delete this URL!");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// GET /register
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = userID ? users[userID] : null;
  res.render("register", { user });
});

// GET /login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = userID ? users[userID] : null;
  res.render("login", { user });
});

// GET /
app.get("/", (req, res) => {
  res.send("Hello!");
});

// GET /urls
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = userID ? users[userID] : null;
  const userURLs = urlsForUser(userID);
  const templateVars = { user, urls: userURLs };
  res.render("urls_index", templateVars);
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.redirect("/login");
  }

  res.render("urls_new", {user});
});

// GET /urls/:id
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("Please log in first!");
  }
  const url = urlDatabase[req.params.id];
  const templateVars = { id: req.params.id, longURL: url.longURL };
  res.render("urls_show", templateVars);
});

// GET /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET /u/:id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
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