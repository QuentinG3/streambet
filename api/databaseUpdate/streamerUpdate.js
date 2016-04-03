var Streamer = require('../../models/Streamer')


var updateNonOnlineStreamer = function(err,streamer){
    if(err) return console.error("Error in online streamer update",err);
    streamer.online = false;
    streamer.viewers = 0;
    streamer.save(function(err){
      if (err) throw err;
    });
}

var updateOnlineStreamer = function(err,streamer,streamerInfo){
    streamer.online = true;
    streamer.viewers = streamerInfo['stream']['viewers'];
    streamer.save(function(err){
    if (err) throw err;
    });
}

var updateStreamer = function(err,streamInfo,streamer){
  if (streamInfo['stream'] == null){
    console.log(streamer['channelName']+" is not online");
    Streamer.findById(streamer['id'],updateNonOnlineStreamer);
    }
  else if (streamInfo['stream']['game'] != "League of Legends"){
    console.log(streamer['channelName']+" not playing League of legends");
    Streamer.findById(streamer['id'],updateNonOnlineStreamer);
  }
  else{
    console.log(streamer['channelName']+" is online");
    Streamer.findById(streamer['id'],function(err,streamDb){
      updateOnlineStreamer(err,streamDb,streamInfo);
    });
    }
  }


module.exports = {
  updateNonOnlineStreamer : updateNonOnlineStreamer,
  updateOnlineStreamer : updateOnlineStreamer,
  updateStreamer:updateStreamer


}
