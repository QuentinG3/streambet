module.exports = {

  //TODO : get streamer list
  /* Show the online lol streamer.  */
  streamers : function(req, res, next) {
    res.render('streamers', {});
  },

  //TODO : Get streamer info (summoners,game,etc) and bet info
  /* Show the stream, game info and bet system. */
  stream : function(req, res, next) {
    res.render('stream', {});
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
