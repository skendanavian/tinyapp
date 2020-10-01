






const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

const validEmail = (users, userEmail) => {
  // (Object.keys(users)).forEach((e) => users[e].email !== userEmail ? true : false);
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

module.exports = {generateRandomString, validEmail, validateUser};