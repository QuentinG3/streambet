var express = require('express');
var router = express.Router();
var swig  = require('swig');

var base = require('./base');
var account = require('./account');
var lolbet = require('./lolbet');


/* GET Home page. */
router.get('/', base.home);

/* GET 404 page. */
router.get('/404', base.page404);

/* GET About page. */
router.get('/about', base.about);

/* GET FAQ page. */
router.get('/faq', base.faq);

/* GET Contact page. */
router.get('/contact', base.contact);

/* GET Login page. */
router.get('/login', account.login);

/* GET Signup page. */
router.get('/signup', account.signup);

/* GET Profil page. */
router.get('/profil', account.profil);

/* GET Recover account page. */
router.get('/recover', account.recover);

/* GET streamers page. */
router.get('/streamers', lolbet.streamers);

/* GET stream page. */
router.get('/stream/:name', lolbet.stream);

/* GET Ranking page. */
router.get('/ranking', lolbet.ranking);

/* GET add_streamer page. */
//TODO : Keep or remove? get the list of region
//router.get('/new_streamer', lolbet.add_streamer);

module.exports = router;
