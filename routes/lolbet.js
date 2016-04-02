var Streamer = require('../models/Streamer');

module.exports = {

  /* Show the online lol streamer.  */
  streamers : function(req, res, next) {
    Streamer.find({online: true}, "channelName viewers preview", function(err,streamerList){
      res.render('streamers', {streamer_list: streamerList});
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
        res.render('base', {});
      }else if(streamer){
        res.render('stream', {streamer: streamer});
      }else{
        res.render('base', {});
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
