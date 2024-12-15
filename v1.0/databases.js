// sample databases to run TinyApp and express_server.js

const bcrypt = require("bcryptjs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW",
  },
  s2ttqf: {
    longURL: "https://www.lighthouselabs.ca",
    userId: "aJ48lW"
  }
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

module.exports = {urlDatabase, users };