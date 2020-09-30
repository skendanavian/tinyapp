const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {response} = require('express');
const PORT = 8080;
const cookieParser = require('cookie-parser')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

const validEmail = (userEmail) => {
  // (Object.keys(users)).forEach((e) => users[e].email !== userEmail ? true : false);
  for (let userId in users) {
    if (users[userId].email === userEmail) {
      return false;
    }
  }
  return true;
};

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
  const templateVars = {user, urls: urlDatabase};

  // console.log(templateVars.user.email);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id']
  const templateVars = {user: users[userId]}
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id']
  const templateVars = {user: users[userId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  if (templateVars.longURL) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404);
    res.send('<h1>404 Error\n</h1> <p>This address does not exist!</p>');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send('<h1>404 Error\n</h1> <p>This address does not exist!</p>');
  }
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  templateVars = {id: userId, email: req.body['email'], password: req.body['password']}
  const emailCheck = validEmail(templateVars.email);
  if (templateVars.email === "" || templateVars.password === "" || !emailCheck) {
    res.status(400);
    res.send('<h1>Registration Failed: Please try again.\n</h1><p>400 Error\n</p>');
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

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.updatedURL;
  res.redirect('/urls');

})

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});