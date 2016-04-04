var Streamer = require('../models/Streamer');
var base = require('./base');

module.exports = {

  /* Show the online lol streamer.  */
  streamers : function(req, res, next) {
    Streamer.find({online: true}, "channelName viewers preview",{ sort:{viewers : -1}}, function(err,streamerList){
      res.render('streamers', {streamer_list: streamerList, isAuthenticated: req.isAuthenticated(), user: req.user});
    });
  },

  //TODO : Get streamer info (summoners,game,etc) and bet info
  /* Show the stream, game info and bet system. */
  stream : function(req, res, next) {
    //Getting the streamer name
    var name = req.params.name;

    //Database lookup
    Streamer.findOne({channelName: name}, "channelName name ", function(err,streamer){
      if(err) {
        //TODO res.redirect('/404');
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
      }else if(streamer){
        res.render('stream', {streamer: streamer, bet_range: [1,2,3,4,5,6,7,8,9,10]});
      }else{
        //TODO res.redirect('/404');
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
      }
    });
  },

  //TODO : Get the best ranked account
  /* Show the ranking of the best player of the website. */
  ranking : function(req, res, next) {
    res.render('ranking', {});
  },

  /* Allow the user to request a streamer. */
  add_streamer : function(req, res, next) {
    res.render('add_streamer', {});
  }

}
