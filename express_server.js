const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const PORT = 8080;

const {generateRandomString, validateUser, urlsForUser, LoggedInCheck, getUserByEmail} = require('./helpers')

//npm package settings

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['fjioeacoiejaf78912810938923ncasajioeawc', 'kfkoecijeaionecowefnilacnuiew87635vdsaceaw'],
}));

//User and URL Databases

const urlDatabase = {

};

const users = {

};

///////////////////////////////////////////////////////
//    GET ROUTES
///////////////////////////////////////////////////////


app.get("/", (req, res) => {
  const userId = req.session.user_id;
  const user = LoggedInCheck(users, userId);
  if (user) {
    res.redirect("/urls");
  }
  else {
    res.redirect("/login")
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = LoggedInCheck(users, userId);

  if (user) {
    const userUrls = urlsForUser(urlDatabase, userId);
    const templateVars = {user, urls: userUrls, error: null};
    res.render("urls_index", templateVars);
  } else {
    res.render('urls_index', {user, urls: null, error: 1})
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: users[userId]}

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = LoggedInCheck(users, userId);
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {user: users[userId], urls: urlDatabase, error: null};
    res.render('register', templateVars);
  }
});


app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = LoggedInCheck(users, userId);
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {user, urls: urlDatabase, error: null};
    res.render('login', templateVars);
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = LoggedInCheck(users, userId);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : null;
  const templateVars = {shortURL, longURL, user: users[userId], error: null};

  if (user) {
    const userUrls = urlsForUser(urlDatabase, user.id);
    for (let url of userUrls) {
      if (url.shortURL === shortURL && url.longURL) {
        return res.render("urls_show", templateVars);
      }
    }
  }
  res.status(404);
  res.render('urls_index', {user, urls: null, error: "The requested URL is not available: 404 Error"});
});

app.get("/u/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = LoggedInCheck(users, userId);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : null;

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404);
    res.render('urls_index', {user, urls: null, error: "Invalid URL: 404 Error"});
  }
});


///////////////////////////////////////////////////////
//  POST ROUTES
///////////////////////////////////////////////////////


app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const {email, password} = req.body;
  const user = getUserByEmail(email, users);

  if (email === "" || password === "" || user) {
    res.status(400);
    res.render('register', {user: null, error: "Failed Registration Attempt"});

  } else {
    users[userId] = {
      id: userId,
      email: email,
      password: bcrypt.hashSync(password, salt)
    }
    req.session['user_id'] = userId;
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  const {email, password} = req.body
  if (email === "" || password === "") {
    res.status(403);
    res.render('login', {user: null, error: "Failed Login Attempt"})
  } else {
    const user = getUserByEmail(email, users)
    const validUser = validateUser(bcrypt, user, email, password)

    if (validUser) {
      req.session.user_id = user.id;
      return res.redirect('/urls');
    } else {
      res.status(403);
      res.render('login', {user: null, error: "Failed Login Attempt"});
    }
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  const userId = req.session.user_id;
  const user = LoggedInCheck(users, userId);
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
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = LoggedInCheck(users, userId);
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
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  templateVars = {shortURL, longURL, user: userID}
  urlDatabase[shortURL] = {
    longURL: templateVars.longURL,
    userID: userID
  }
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});