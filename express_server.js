const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {response} = require('express');
const PORT = 8080;
const cookieParser = require('cookie-parser')
const {generateRandomString, validEmail, validateUser, urlsForUser} = require('./helpers')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "ism5xK": {longURL: "http://www.google.com", userID: "user2RandomID"},
  "ism5xK": {longURL: "http://www.google.com", userID: "userRandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "easy"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "easy"
  }
};

console.log(urlsForUser(urlDatabase, 'userRandomID'))

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id']
  const user = users[userId] ? users[userId] : null;

  if (user) {
    const userUrls = urlsForUser(urlDatabase, userId);
    const templateVars = {user, urls: userUrls, error: null};
    console.log(userUrls)
    res.render("urls_index", templateVars);
  } else {

    res.render('urls_index', {user, urls: null, error: "Please create an account or login to access your URLs !"})
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {user: users[userId]}
  console.log(userId)
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  const userId = req.cookies['user_id']
  // const user = users[userId] ? users[userId] : null;
  const templateVars = {user: users[userId], urls: urlDatabase, error: null};
  res.render('register', templateVars);
});
app.get("/login", (req, res) => {
  const userId = req.cookies['user_id']
  const user = users[userId] ? users[userId] : null;
  const templateVars = {user, urls: urlDatabase, error: null};
  res.render('login', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  const userId = req.cookies['user_id'];
  const user = users[userId] ? users[userId] : null;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : null;
  const templateVars = {shortURL, longURL, user: users[userId], error: null};

  for (let url in urlDatabase) {
    if (url === shortURL && urlDatabase[url].longURL) {
      return res.render("urls_show", templateVars);
    }
  }
  res.status(404);
  res.render('urls_index', {user, urls: null, error: "Invalid URL: 404 Error"})

});

app.get("/u/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId] ? users[userId] : null;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : null;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404);
    res.render('urls_index', {user, urls: null, error: "Invalid URL: 404 Error"})
  }
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  templateVars = {id: userId, email: req.body['email'], password: req.body['password']}
  const emailCheck = validEmail(users, templateVars.email);
  if (templateVars.email === "" || templateVars.password === "" || !emailCheck) {
    res.status(400);
    // res.send('<h1>Registration Failed: Please try again.\n</h1><p>400 Error\n</p>');
    res.render('register', {user: null, error: "Failed Registration Attempt"})
  } else {
    users[userId] = {
      id: userId,
      email: templateVars.email,
      password: templateVars.password
    }
    console.log(users)
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
});



app.post("/login", (req, res) => {
  const {email, password} = req.body
  const userId = res.cookie['user_id']
  const emailCheck = validEmail(users, email);
  if (email === "" || password === "" || emailCheck) {
    res.status(403);
    res.render('login', {user: null, error: "Failed Login Attempt"})
  } else {
    const userId = validateUser(users, email, password)
    if (userId) {
      res.cookie('user_id', userId.id);
      return res.redirect('/urls');
    } else
      res.status(403);
    res.render('login', {user: null, error: "Failed Login Attempt"})
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


app.post("/urls/:id/update", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId] ? users[userId] : null;
  let link = req.params.id;
  if (user) {
    const userUrls = urlsForUser(urlDatabase, userId)
    for (let e of userUrls) {
      if (e.shortURL === link) {
        urlDatabase[link] = {
          longURL: req.body.updatedURL, userID: userId
        }
        return res.redirect('/urls');
      }
    }
  }
  return res.status(400);
  // res.render('urls_index', {
  //   user, urls: null, error: "Unauthorized Request"
  // })
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId] ? users[userId] : null;
  const shortURL = req.params.shortURL;
  if (user) {
    const userUrls = urlsForUser(urlDatabase, userId)
    for (let e of userUrls) {
      if (e.shortURL === shortURL) {
        delete urlDatabase[shortURL];
        return res.redirect('/urls');
      }
    }
  }
  return res.status(400);
  // res.render('urls_index', {
  //   user, urls: null, error: "Unauthorized Request"
  // })
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.cookies['user_id']
  const longURL = req.body.longURL;
  templateVars = {shortURL, longURL, user: userID}
  console.log(userID)
  urlDatabase[shortURL] = {
    longURL: templateVars.longURL,
    userID: userID
  }
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});