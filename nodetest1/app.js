var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongo = require('mongodb');
//var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
//var monk = require('monk');
//var db = monk('localhost:27017/nodetest1');
//var uri = "mongodb://trustuslife:india123@ourbackend-shard-00-00-rcuwr.mongodb.net:27017,ourbackend-shard-00-01-rcuwr.mongodb.net:27017,ourbackend-shard-00-02-rcuwr.mongodb.net:27017/UserInfo?ssl=true&replicaSet=OurBackend-shard-0&authSource=admin";
	

var index = require('./routes/index');
//var users = require('./routes/users');

var app = express();
// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('keys/privkey.pem'),
  cert: fs.readFileSync('keys/fullchain.pem')
};

app.use(require('helmet')());
// Create an HTTP service.
http.createServer(app).listen(80);

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.LoggedUser;
  if (cookie === undefined)
  {
    // no: set a new cookie
    res.cookie('LoggedUser',"None", { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully');
  } 
  else
  {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  } 
  next(); // <-- important!
});
app.use(express.static(path.join(__dirname, 'public')));


/*
// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();

});*/

app.use('/', index);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
