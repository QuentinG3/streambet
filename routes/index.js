var express = require('express');
var router = express.Router();
var swig  = require('swig');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('base', {
  });
});

router.get('/about', function(req, res, next) {
  res.render('about', {
  });
});

router.get('/faq', function(req, res, next) {
  res.render('faq', {
  });
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {
  });
});

module.exports = router;
