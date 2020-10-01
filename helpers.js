






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

const validEmail = (users, userEmail) => {
  for (let userId in users) {
    const currentUser = users[userId]
    if (currentUser.email === userEmail) {
      return false;
    }
  }
  return true;
};

const validateUser = (users, email, password) => {
  for (let user in users) {
    const currentUser = users[user];
    if (currentUser.email === email && currentUser.password === password) {
      return currentUser;
    }
  }
  return null;
};

module.exports = {generateRandomString, validEmail, validateUser, urlsForUser};