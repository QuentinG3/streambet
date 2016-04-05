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

var routes = require('./routes/index');


var apiRoutines = require('./api/apiRoutines');
var socketIOManagement = require('./sockets/base');


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

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: process.env.SESSION_SECRET || 'keyboard monkey',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use('/', routes);
//Database connection
mongodb_connection_string = '127.0.0.1:27017/streambet';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect(mongodb_connection_string);


// passport config
var email_regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
var User = require('./models/User');
passport.use(new LocalStrategy(
  function(username, password, done) {
    if (email_regex.test(username)){
      //Get user with his username
      User.findOne({ email: username.toLowerCase() }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.verifyPasswordSync(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }else{
      //Get user with his username
      User.findOne({ username: username.toLowerCase() }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.verifyPasswordSync(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({_id: id}, function(err, user) {
    done(err, user);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //TODO res.redirect('/404');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
