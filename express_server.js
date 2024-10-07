// Setup
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const { urlDatabase, users } = require("./databases");
const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true}));
app.use(morgan("dev"));
app.use(cookieSession({ name: "session", keys: ["dodecaphony"] }));

// GET /register: checks if there is a user logged in, sets a cookie if there is or sets user to null if not, renders registration page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = userID ? users[userID] : null;
  res.render("register", { user });
});

// POST /register: handles registration submissions
app.post("/register", (req, res) => {
  // capturing user input
  const email = req.body.email;
  const password = req.body.password;

  // ensures user actually submits an email AND a password
  if (!email || !password) {
    return res.status(400).send("You must provide an email and a password!");
  }

  // checks against database if email has already been registered
  const foundUser = getUserByEmail(users, email);
  console.log("*** foundUser: ", foundUser);

  if (foundUser) {
    return res.status(400).send("Email already exists!");
  }

  // newly generated ID for new accounts
  const id = generateRandomString();

  // hashing password and creating user object
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id, email, password: hashedPassword };
  users[id] = user;
  req.session.user_id = id;
  res.redirect("/urls");
});

// GET /login: checks if there is a user logged in, sets a cookie if there is or sets user to null if not, renders registration page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = userID ? users[userID] : null;
  res.render("login", { user });
});

// POST /login: handles login submissions
app.post("/login", (req, res) => {
  //capturing user input
  const email = req.body.email;
  const password = req.body.password;
  
  // ensures user actually submits an email AND a password
  if (!email || !password) {
    return res.status(400).send("You must provide an email and a password!");
  }

  // checks against database to see if user exists
  const foundUser = getUserByEmail(users, email);

  if (!foundUser) {
    return res.status(403).send("User not found. Please register to log in!");
  }

  // password security check
  if (bcrypt.compareSync(password, foundUser.password) === false) {
    return res.status(403).send("Email or password incorrect. Please try again!");
  }

  const id = foundUser.id;

  req.session.user_id = id;
  res.redirect("/urls");
});

// POST /logout: handles logout submissions, clears all cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// GET /urls: "home page," checks if user is logged in, rejects request if not, renders main page based on user object if login is successful
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId === null) {
    return res.status(401).send("Please log in first!");
  }
  const user = userId ? users[userId] : null;
  const userURLs = urlsForUser(userId, urlDatabase);
  const templateVars = { user, urls: userURLs };
  res.render("urls_index", templateVars);
});

// POST /urls: handles requests for creating new short URLs
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  // check disallows a user to see main page if not logged in
  if (!userId) {
    return res.status(403).send("You must be logged in to shorten a URL!");
  }

  // capturing submitted URL and creating a random string as its shortened URL
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = { longURL, userId: userId };
  res.redirect(`/urls/${id}`);
});

// GET /urls/new: checks if user is logged in. if not, user is redirected to login page, if yes, renders new URL submission form
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.redirect("/login");
  }

  res.render("urls_new", { user });
});

// GET /urls/:id: edit page for a user's specific short URL
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  // check disallows user to see page if not logged in
  if (!userID) {
    return res.status(401).send("Please log in first!");
  }

  // variables access user's data and urlsForUser gathers any previously saved URLs by user
  const user = users[userID];
  const url = urlDatabase[req.params.id];
  const urlID = req.params.id;
  const userURLs = urlsForUser(user.id, urlDatabase);
  const userIDs = Object.keys(userURLs);
  const templateVars = { user, id: urlID, longURL: url.longURL };
  
  // disallows logged in user from viewing short URLs not created by them
  for (const id of userIDs) {
    if (id === urlID) {
      res.render("urls_show", templateVars);
    } else {
      return res.status(403).send("You do not have access to this short URL!");
    }
  }
});

// POST /urls/:id: handles submissions to create new short URLs
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  
  // check ensures user is logged in to submit form
  if (!userId) {
    return res.status(401).send("Please log in first!");
  }
  
  // ensures user is not trying to edit a short URL that does not belong to them
  const url = urlDatabase[req.params.id];
  if (!url || url.userId !== userId) {
    return res.status(403).send("You do not have permission to edit this URL!");
  }

  // after successful submission, new short URL is stored and user is redirected to main page
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// POST /urls/:id/delete: handles submissions for deleting stored URLs
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;

  // check ensures user is logged in to submit form
  if (!userId) {
    return res.status(401).send("Please log in first!");
  }

  // disallows user from deleting a short URL that does not belong to them
  const url = urlDatabase[req.params.id];
  if (!url || url.userId !== userId) {
    return res.status(403).send("You do not have permission to delete this URL!");
  }

  // after successful submission, short URL is deleted from database and user is redirected to main page
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// GET /u/:id: handles requests for direct redirection to user's saved URLs
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  // ensures requested URL is saved and alerts user if neither longURL nor short URLs are found
  if (longURL) {
    res.redirect(longURL);
  } else if (!longURL) {
    res.status(404).send("Requested URL not found!");
  } else {
    res.status(404).send("Short URL not found!");
  }
});

// LISTEN
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});