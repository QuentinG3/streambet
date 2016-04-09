  var express = require('express');
var socket_io    = require( "socket.io" );
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var swig = require('swig');
var session = require('express-session');
var bcrypt = require("bcrypt-nodejs");

var database = require('./database/connection');

var routes = require('./routes/index');

var apiRoutines = require('./api/apiRoutines');
var socketIOManagement = require('./sockets/base');

//debugs
var userPassportDebug = require('debug')('userPassport');


var app = express();

var io = socket_io();
app.io = io;

//Start socket io
socketIOManagement.startSocketIO(io);
//Starting api update routines
apiRoutines.startApiRoutineLoop(io);

//Make the app use Swig to render file
app.engine('html', swig.renderFile);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//database connection
mongodb_connection_string = '127.0.0.1:27017/streambet';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect(mongodb_connection_string);

var MongoStore = require('connect-mongo')(session);
var mongoStore = new MongoStore({ mongooseConnection: mongoose.connection });
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard monkey',
    resave: false,
    store: mongoStore,
    saveUninitialized:false
}));



var passportSocketIo = require("passport.socketio");
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       'keyboard monkey',    // the session_secret to parse the cookie
  store:        mongoStore,   // we NEED to use a sessionstore. no memorystore please
  //success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:         onAuthorizeFail     // *optional* callback on fail/error - read more below
}));


// This function accepts every client unless there's an error
function onAuthorizeFail(data, message, error, accept){
  accept(null, !error);
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use('/', routes);


// passport config
var email_regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
var User = require('./models/User');
passport.use(new LocalStrategy(
  function(username, password, done) {

    if (email_regex.test(username)){
      //Get user with his email
      database.users.getUserByEmail(username.toLowerCase())
      .then(function(user){
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        bcrypt.compare(password, user.password, function(err, res) {
            if(!res){
              return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
      })
      .catch(function(){
        userPassportDebug(errorGettingUserByEmail);
        return done(errorGettingUserByEmail);
      });
    }else{
      //Get user with his username
      database.users.getUserByUsername(username.toLowerCase())
      .then(function(user){
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        bcrypt.compare(password, user.password, function(err, res) {
            if(!res){
              return done(null, false, { message: 'Incorrect password.' });
            }

        });
        return done(null, user);
      })
      .catch(function(errorGettingUserByUsername){
        userPassportDebug(errorGettingUserByUsername);
        return done(errorGettingUserByUsername);
      });
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  database.users.getUserByUsername(username)
  .then(function(user){
    done(null, user);
  })
  .catch(function(errorGettingUserByUsername){
    done(errorGettingUserByUsername, null);
    userPassportDebug(errorGettingUserByUsername);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  res.render('404', {
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
    url: req.url
  });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
