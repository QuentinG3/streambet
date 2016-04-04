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
	["Night Blue","Nightblue3",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_nightblue3-320x180.jpg",[{name:"Nightblue3",region:"na",summonerId:"25850956"},{name:"EU Flamingo",region:"euw",summonerId:"77348710"},{name:"NB3",region:"na",summonerId:"52839418"},{name:"NB3",region:"euw",summonerId:"52839418"}]],
	["Good Guy Garry","GoodGuyGarry",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_goodguygarry-320x180.jpg",[{name:"Bronze 5 Haircut",region:"na",summonerId:"72720995"}]],
	["Scarra","Scarra",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_scarra-320x180.jpg"],
	["Wings of Death","Wingsofdeath",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_wingsofdeath-320x180.jpg",[{name:"Wingsofdeath",region:"na",summonerId:"53742348"}]],
    ["Gosu","mushisgosu",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_mushisgosu-320x180.jpg",[{name:"hi im gosu",region:"na",summonerId:"23557909"},{name:"45620",region:"na",summonerId:"20967047"},{name:"plzbuffmarksman",region:"na",summonerId:"26463128"},
    {name:"7151921",region:"na",summonerId:"70423058"},{name:"G U CK F O S U",region:"na",summonerId:"22277779"}]],
    ["Imaqtpie","imaqtpie",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_imaqtpie-320x180.jpg",[{name:"Imaqtpie",region:"na",summonerId:"19887289"},{name:"feed l0rd",region:"na",summonerId:"35301382"}]],
    ["Riot","riotgames",0,"https://static-cdn.jtvnw.net/previews-ttv/live_user_riotgames-320x180.jpg"],
    ["Iwilldominate","iwilldominate",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_iwilldominate-320x180.jpg",[{name:"IWDominate3",region:"na",summonerId:"50529339"}]],
    ["Taour","taourrr1030",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_taourrr1030-320x180.jpg",[{name:"EagleStick",region:"euw",summonerId:"27689318"}]],
    ["Crvor","iamcrvor",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_iamcrvor-320x180.jpg",[{name:"crvor",region:"euw",summonerId:"18977877"}]],
    ["Sylrus","sylrus",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_sylrus-320x180.jpg",[{name:"Pornstar Dovah",region:"euw",summonerId:"59837265"}]],
      ["Sneaky","c9sneaky",0,"http://static-cdn.jtvnw.net/previews-ttv/live_user_c9sneaky-320x180.jpg",[{name:"C9 StealthBomber",region:"na",summonerId:"44989300"}]],
];


async.each(streamerList,function(oneStreamer,callback){
  var newStreamer = new streamer({name : oneStreamer[0],channelName: oneStreamer[1],online : false,viewers: oneStreamer[2],preview: oneStreamer[3],summoners:oneStreamer[4],game:null});

  newStreamer.save(function(err){
    if (err) return console.error("Error in streamer creation in database",err);
    callback();
  });
},function(err){
  console.log("done");
  mongoose.disconnect();
});
