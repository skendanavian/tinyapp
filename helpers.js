const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

const urlsForUser = (urlDatabase, id) => {
  const userUrls = [];
  const urlIds = Object.keys(urlDatabase);
  for (let key of urlIds) {
    const obj = urlDatabase[key]
    if (obj.userID === id) {
      userUrls.push({
        shortURL: key,
        longURL: obj.longURL
      });
    }
  }
  return (userUrls);
};

const getUserByEmail = (email, database) => {
  for (let user in database) {
    const currentUser = database[user];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return undefined;
};

const validateUser = (bcrypt, user, email, password) => {
  if (user.email === email && bcrypt.compareSync(password, user['password'])) {
    return true;
  } else {
    return false;
  }
};

const LoggedInCheck = (database, userID) => {
  if (database[userID]) {
    return database[userID];
  }
  else {
    return null;
  }

}


module.exports = {generateRandomString, validateUser, urlsForUser, LoggedInCheck, getUserByEmail}