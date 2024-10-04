const { assert } = require("chai");
const { getUserByEmail, urlsForUser, generateRandomString } = require("../helpers.js");

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID, "The user ID should match the expected user ID");
  });
  
  it("should return null if a non-existent email is submitted", function() {
    const user = getUserByEmail(testUsers, "nonexistent@example.com"); // Use a non-existent email
    const expectedUser = null;
    assert.strictEqual(user, expectedUser, "The function should return null if a non-existent email is submitted");
  });
});

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const userId = 'user123';
    const urlDatabase = {
      'short1': { longURL: 'http://longurl1.com', userId: 'user123' },
      'short2': { longURL: 'http://longurl2.com', userId: 'user456' },
      'short3': { longURL: 'http://longurl3.com', userId: 'user123' },
    };

    const result = urlsForUser(userId, urlDatabase);
    const expected = {
      'short1': { longURL: 'http://longurl1.com', userId: 'user123' },
      'short3': { longURL: 'http://longurl3.com', userId: 'user123' },
    };

    assert.deepEqual(result, expected);
  });

  it('should return an empty object if the urlDatabase does not contain any urls that belong to the specified user', function() {
    const userId = 'user999';
    const urlDatabase = {
      'short1': { longURL: 'http://longurl1.com', userId: 'user123' },
      'short2': { longURL: 'http://longurl2.com', userId: 'user456' },
    };

    const result = urlsForUser(userId, urlDatabase);
    const expected = {};

    assert.deepEqual(result, expected);
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const userId = 'user123';
    const urlDatabase = {};

    const result = urlsForUser(userId, urlDatabase);
    const expected = {};

    assert.deepEqual(result, expected);
  });

  it('should not return any urls that do not belong to the specified user', function() {
    const userId = 'user456';
    const urlDatabase = {
      'short1': { longURL: 'http://longurl1.com', userId: 'user123' },
      'short2': { longURL: 'http://longurl2.com', userId: 'user456' },
      'short3': { longURL: 'http://longurl3.com', userId: 'user123' },
    };

    const result = urlsForUser(userId, urlDatabase);
    const expected = {
      'short2': { longURL: 'http://longurl2.com', userId: 'user456' },
    };

    assert.deepEqual(result, expected);
  });
});