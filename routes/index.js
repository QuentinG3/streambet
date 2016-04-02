var express = require('express');
var router = express.Router();
var swig  = require('swig');


/* GET Home page. */
router.get('/', function(req, res, next) {
  res.redirect('/streamers');
});

/* GET About page. */
//TODO : Get this text from the database?
router.get('/about', function(req, res, next) {
  res.render('about', {
  about: ['Explaining what streambet is', 'Explaining what streambet could be', 'Explain who we are and why we developped streambet']
  });
});

/* GET FAQ page. */
router.get('/faq', function(req, res, next) {
  res.render('faq', {
    faq: [{id:1, title: "What is streambet ?", text: "response 1"},
          {id:2, title: "Will i be able to bet real money ?", text: "response 2"},
          {id:3, title: "How does the bet works ?", text: "response 3"}]
  });
});

/* GET Contact page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', {
  });
});

/* GET Login page. */
//TODO : Function login and check if user connected or not
router.get('/login', function(req, res, next) {
  res.render('login', {
  });
});

/* GET Signup page. */
//TODO : Function Signup and check if user connected or not
router.get('/signup', function(req, res, next) {
  res.render('signup', {
  });
});

/* GET Profil page. */
//TODO : Check if user connected or not, and provide user info
router.get('/profil', function(req, res, next) {
  res.render('profil', {
  });
});

/* GET Ranking page. */
//TODO : Get the best ranked account
router.get('/ranking', function(req, res, next) {
  res.render('ranking', {
  });
});

/* GET streamers page. */
//TODO : get streamer list
router.get('/streamers', function(req, res, next) {
  res.render('streamers', {
  });
});

/* GET add_streamer page. */
//TODO : Keep or remove? get the list of region
router.get('/new_streamer', function(req, res, next) {
  res.render('add_streamer', {
  });
});

/* GET add_streamer page. */
//TODO : Get streamer info (summoners,game,etc)
router.get('/stream', function(req, res, next) {
  res.render('stream', {
  });
});

module.exports = router;
