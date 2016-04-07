/* jshint moz:true */
var pgp = require('pg-promise')();


var cn = {
    host: 'localhost', // server name or IP address;
    port: 5432,
    database: 'streambet',
    user: 'quentin',
    password: 'azerty'
};

var db = pgp(cn);

/*
_____ _______ _____  ______          __  __ ______ _____   _____
/ ____|__   __|  __ \|  ____|   /\   |  \/  |  ____|  __ \ / ____|
| (___    | |  | |__) | |__     /  \  | \  / | |__  | |__) | (___
\___ \   | |  |  _  /|  __|   / /\ \ | |\/| |  __| |  _  / \___ \
____) |  | |  | | \ \| |____ / ____ \| |  | | |____| | \ \ ____) |
|_____/   |_|  |_|  \_\______/_/    \_\_|  |_|______|_|  \_\_____/


*/
const TABLE_NAME = "streamers";
const ONLINE_COL = "online";
const VIEWERS_COL = "viewers";
const CHANNELNAME_COL = "channelname";

var streamerFunctions = {
  getStreamers : function(field){
    return db.any("SELECT $1~ FROM streamers",field);
  },
  setStreamerOffLine : function(channelName) {
    return db.query("UPDATE $1~ SET "+ONLINE_COL+"=$2, "+VIEWERS_COL+"=$3 WHERE "+CHANNELNAME_COL+"=$4",[TABLE_NAME,false,0,channelName]);
  },
  setStreamerOnLine : function(channelName,viewers) {;
    return db.query("UPDATE $1~ SET "+ONLINE_COL+"=$2, "+VIEWERS_COL+"=$3 WHERE "+CHANNELNAME_COL+"=$4",[TABLE_NAME,true,viewers,channelName]);
  },
  getOnlineStreamers : function(){
    return db.any("SELECT * FROM streamers WHERE "+ONLINE_COL+"=$1",[true]);
  }
};


module.exports = {
  streamer : streamerFunctions
};
