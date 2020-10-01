// For ShortURL and User IDs

const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

//Returns an array of objects for user specific URLs

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

//Returns the user object when given their email

const getUserByEmail = (email, database) => {
  for (let user in database) {
    const currentUser = database[user];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return undefined;
};

//Checks if the user email and password are valid for Login

const validateUser = (bcrypt, user, email, password) => {
  if (user.email === email && bcrypt.compareSync(password, user['password'])) {
    return true;
  } else {
    return false;
  }
};

//Checks if user is currently logged in for page header customization

const LoggedInCheck = (database, userID) => {
  if (database[userID]) {
    return database[userID];
  }
  else {
    return false;
  }

}


module.exports = {generateRandomString, validateUser, urlsForUser, LoggedInCheck, getUserByEmail}