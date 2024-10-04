const { assert } = require("chai");

const getUserByEmail = require("../helpers.js");

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
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID, "The user ID should match the expected user ID");
  });
  
  it("should return null if a non-existent email is submitted", function() {
    const user = getUserByEmail(testUsers, "")
    const expectedUser = null;
    assert.strictEqual(user, expectedUser, "The function should return null if a non-existent email is submitted");
  });
});