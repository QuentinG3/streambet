var express = require('express');
var router = express.Router();

var base = require('./base');
var account = require('./account');
var lolbet = require('./lolbet');
var request = require('./request');


/* GET Home page. */
router.get('/', lolbet.streamers);

/* GET 404 page. */
router.get('/404', base.page404);

/* GET About page. */
router.get('/about', base.about);

/* GET FAQ page. */
router.get('/faq', base.faq);

/* GET Contact page. */
router.get('/contact', base.contact);

/* POST Contact page. */
router.post('/contact', base.sendContactMail);

/* GET How it works page. */
router.get('/how-to-play', base.howtoplay);

/* GET Login page. */
router.get('/login', account.login);

/* POST Login page. */
router.post('/login', account.logUser);

/* GET Signup page. */
router.get('/signup', account.signup);

/* POST Signup page. */
router.post('/signup', account.registerAccount);

/* GET Profil page. */
router.get('/profil', account.profil);

/* POST Profil page. */
router.post('/profil', account.changeProfil);

/* GET logout page. */
router.get('/logoff', account.logoff);

/* GET Recover account page. */
router.get('/recover', account.recover);

/* GET Request streamer page */
router.get('/requests', lolbet.requests);

/* AJAX Vote Streamer */
router.post('/vote-streamer', request.voteStreamer);

/* AJAX Vote Summoner */
router.post('/vote-summoner', request.voteSummoner);

/* GET stream page. */
router.get('/stream/:name', lolbet.stream);

/* GET Ranking page. */
router.get('/ranking', lolbet.ranking);

module.exports = router;
