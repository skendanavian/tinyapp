const {assert} = require('chai');

const {getUserByEmail} = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a specific user object associated with a valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = 'userRandomID';
    assert.equal(expectedOutput, user.id);
  });
  it('should return null when given an invalid email', function() {
    const user = getUserByEmail("user5@example.com", testUsers)
    const expectedOutput = null;
    assert.equal(expectedOutput, user);
  });
  it('should return null when given an empty string', function() {
    const user = getUserByEmail("", testUsers)
    const expectedOutput = null;
    assert.equal(expectedOutput, user)
  });
});