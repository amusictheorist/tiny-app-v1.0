// helper functions to run TinyApp and express_server.js

const getUserByEmail = function(users, email) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function(id, urlDatabase) {
  const userURLs = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userId === id) {
      userURLs[urlID] = urlDatabase[urlID];
    }
  }
  return userURLs;
};

function generateRandomString() {
  let result = Math.random().toString(36).slice(2, 8);
  return result;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };