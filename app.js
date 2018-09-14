var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var passportStrategy = require('./passport');
var logger = require('morgan');
var helmet = require('helmet');
var multipart = require('connect-multiparty');
var expressSession = require('express-session');

const env       = process.env.NODE_ENV || "development";
const config    = require(path.join(__dirname, 'config', 'config.json'))[env];

var routes = require('./routes');

var dbConfig = 'mongodb://apiuser:YWstJS68@ds119688.mlab.com:19688/brollers';
var mongoose = require('mongoose');
var fs = require('fs');

// Connect to DB
// mongoose.connect(dbConfig);
try {
    var dbHealper = require('./models/index');
} catch (err) {
    Logger.info('Connection fail to db with err %s', err.message);
}

var app = express();
app.use(multipart());
app.use(expressSession({
  secret: config.session.secret, 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(logger('dev'));
app.use(cookieParser());
app.use(helmet());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

passportStrategy.initialize(passport);

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
