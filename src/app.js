const express = require("express");
const hbs = require("hbs");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const crypto = require('crypto');
require("dotenv").config();

// Generate a random session secret
const generateSessionSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};
const sessionSecret = generateSessionSecret();

hbs.registerHelper('eq', function (a, b, options) {
  if (a === b) {
    return true;
  } else {
    return false;
  }
});

const app = express();
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.SESSION_STORE,
    ttl: 3600,
    autoRemove: 'interval',
    autoRemoveInterval: 60,
  })
}));
// console.log('Session secret:', sessionSecret);
const routes = require("./routes/main");


app.use('/static', express.static('public'));
app.use("",routes);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


// template engine
app.set('view engine', 'hbs');
app.set("views", "views");
hbs.registerPartials("views/partials");

app.listen(process.env.PORT || 5566, ()=>{
    console.log(`Server Started At localhost:${process.env.PORT || 5566}`);
});