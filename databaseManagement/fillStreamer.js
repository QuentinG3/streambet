var mongoose = require('mongoose');
var streamer = require('../models/Streamer');
var async = require('async');

mongodb_connection_string = '127.0.0.1:27017/streambet';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect(mongodb_connection_string);

var streamerList = [
	["Night Blue","Nightblue3",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_nightblue3-320x180.jpg"],
	["Good Guy Garry","GoodGuyGarry",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_goodguygarry-320x180.jpg"],
	["Scarra","Scarra",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_scarra-320x180.jpg"],
	["Wings of Death","Wingsofdeath",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_wingsofdeath-320x180.jpg"],
    ["Gosu","mushisgosu",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_mushisgosu-320x180.jpg"],
    ["Imaqtpie","imaqtpie",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_imaqtpie-320x180.jpg"],
    ["Riot","riotgames",0,"https://static-cdn.jtvnw.net/previews-ttv/live_user_riotgames-320x180.jpg"],
];


async.each(streamerList,function(oneStreamer,callback){
  var newStreamer = new streamer({name : oneStreamer[0],channelName: oneStreamer[1],online : false,viewers: oneStreamer[2],preview: oneStreamer[3]});

  newStreamer.save(function(err){
    if (err) return console.error("Error in streamer creation in database",err);
    callback();
  });
},function(err){
  console.log("done");
  mongoose.disconnect();
});
