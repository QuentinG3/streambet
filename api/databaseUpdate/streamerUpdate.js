var Streamer = require('../../models/Streamer')

//debugs
var debugUpdateStreamerDebug = require('debug')('updateStreamer');

var updateNonOnlineStreamer = function(err,streamer,callback){
    if(err) return console.error("Error in non online streamer update",err);
    streamer.online = false;
    streamer.viewers = 0;
    streamer.save(function(err){
      if (err) throw consonle.error("Error when saving the non online streamer",err);
      callback();
    });
}

var updateOnlineStreamer = function(err,streamer,streamerInfo,callback){
      if(err) return console.error("Error in online streamer update",err);
    streamer.online = true;
    streamer.viewers = streamerInfo['stream']['viewers'];
    streamer.save(function(err){
    if (err) throw consonle.error("Error when saving the online streamer",err);
    callback();
    });
}

var updateStreamer = function(err,streamInfo,streamer,callback){
  if (err) return console.error("Error in twitch api request "+ err,err);
  if(streamer != null){

    if (streamInfo['stream'] == null){
      debugUpdateStreamerDebug(streamer['channelName']+" is not online");
      Streamer.findById(streamer['id'],updateNonOnlineStreamer(err,streamer,callback));
      }
    else if (streamInfo['stream']['game'] != "League of Legends"){

      debugUpdateStreamerDebug(streamer['channelName']+" not playing League of legends");
      Streamer.findById(streamer['id'],updateNonOnlineStreamer(err,streamer,callback));
    }
    else{
      debugUpdateStreamerDebug(streamer['channelName']+" is online");
      Streamer.findById(streamer['id'],function(err,streamDb){
        updateOnlineStreamer(err,streamDb,streamInfo,callback);
      });
    }
  }
  else{
    callback();
  }
}


module.exports = {
  updateNonOnlineStreamer : updateNonOnlineStreamer,
  updateOnlineStreamer : updateOnlineStreamer,
  updateStreamer:updateStreamer


}
