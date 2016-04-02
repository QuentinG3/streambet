var twitch = require("twitch.tv");
var async = require("async");
var Streamer = require('../models/Streamer')

var streamerUpdate = require('./databaseUpdate/streamerUpdate')

module.exports = {
  /*
  Function to update streamers viewers and online in the database by
  requesting the API.
  */
  updateStreamers: function(){
    //We get all the streamers channelName
    Streamer.find({},"channelName",function(err,streamersList){
      //For each streamer we request the twitch API asyncroniously.
      async.each(streamersList,function(streamer,callback){
        //Calling the api
        twitch("streams/"+streamer['channelName'],function(err,streamInfo){
          streamerUpdate.updateStreamer(err,streamInfo,streamer);
          });
        });
    });

}
}
