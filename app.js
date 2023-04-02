/* 
 * Package Imports
*/

const path = require("path");
require("dotenv").config();
const express = require('express');
const partials = require('express-partials');
const session = require('express-session');
const pssport = require('passport');
const passport = require("passport");
const GitHubStrategy = require('passport-github2').Strategy;
const app = express();


/*
 * Variable Declarations
*/

const PORT = 3000;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/*
 * Passport Configurations
*/

passport.use(new GitHubStrategy({
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback"
}, function (accessToken, rereshToken, profile, done) {
  return done(null, profile)
})
)

passport.serializeUser(function (user, done) {
  done(null, user);
})

passport.deserializeUser(function (user, done) {
  done(null, user);
})




/*
 *  Express Project Setup
*/

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(passport.session());
app.use(session({
  secret: 'codecademy',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());


/*
 * Routes
*/

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
})

// 5.3 We will need to protect the /account route to make it only accessible if a user is logged in by adding a middleware function ensureAuthenticated().
app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
})

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// 5.1 When visiting /auth/github, the client will be redirected to GitHub for authorizing.
app.get('/auth/github', passport.authenticate('github', { scope: ['user'] }));

// 5.2 Implement the Authorization callback URL, which was defined in the GitHub application settings. This is where GitHub will redirect after a user authorizes it.
app.get('/auth/github/callback', passport.authenticate('github', {
  // Redirect users back to the login page in the event of a failed authorization.
  failureRedirect: '/login',
  // Set the successRedirect key to '/' to redirect users to the home page after a successful authorization attempt.
  successRedirect: '/'
})
);

/*
 * Listener
*/

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

/*
 * ensureAuthenticated Callback Function
*/

// 5.4 Define the ensureAuthenticated() function to handle verifying if a request is authenticated.
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } res.redirect('/login');
}