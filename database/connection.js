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
const STREAMER_TABLE_NAME = "streamers";
const ONLINE_COL = "online";
const VIEWERS_COL = "viewers";
const CHANNELNAME_COL = "channelname";

var streamerFunctions = {
  getStreamers : function(field){
    return db.any("SELECT $1~ FROM streamers",field);
  },
  setStreamerOffLine : function(channelName) {
    return db.query("UPDATE $1~ SET "+ONLINE_COL+"=$2, "+VIEWERS_COL+"=$3 WHERE "+CHANNELNAME_COL+"=$4",[STREAMER_TABLE_NAME,false,0,channelName]);
  },
  setStreamerOnLine : function(channelName,viewers) {;
    return db.query("UPDATE $1~ SET "+ONLINE_COL+"=$2, "+VIEWERS_COL+"=$3 WHERE "+CHANNELNAME_COL+"=$4",[STREAMER_TABLE_NAME,true,viewers,channelName]);
  },
  getOnlineStreamers : function(){
    return db.any("SELECT * FROM $1~ WHERE "+ONLINE_COL+"=$2",[STREAMER_TABLE_NAME,true]);
  }
};

/*
_____ _    _ __  __ __  __  ____  _   _ ______ _____   _____
/ ____| |  | |  \/  |  \/  |/ __ \| \ | |  ____|  __ \ / ____|
| (___ | |  | | \  / | \  / | |  | |  \| | |__  | |__) | (___
\___ \| |  | | |\/| | |\/| | |  | | . ` |  __| |  _  / \___ \
____) | |__| | |  | | |  | | |__| | |\  | |____| | \ \ ____) |
|_____/ \____/|_|  |_|_|  |_|\____/|_| \_|______|_|  \_\_____/
*/
const SUMMONERS_TABLE_NAME = "summoners";
const STREAMER_COL_SUMMONERS = "streamer";

var summonersFunctions = {
  getSummonerOfOnlineStreamers : function(){
    return db.any("SELECT * FROM $1~,$2~ WHERE $1~."+STREAMER_COL_SUMMONERS+"=$2~."+CHANNELNAME_COL+" AND $2~."+ONLINE_COL+"=true",[SUMMONERS_TABLE_NAME,STREAMER_TABLE_NAME]);
  }
};
/*
_____          __  __ ______
/ ____|   /\   |  \/  |  ____|
| |  __   /  \  | \  / | |__
| | |_ | / /\ \ | |\/| |  __|
| |__| |/ ____ \| |  | | |____
\_____/_/    \_\_|  |_|______|
*/

const GAME_TABLE_NAME = "game";
const STREAMER_COL_GAME = "streamer"
var gameFunction = {
  getGameOfStreamer : function(channelName){
    return db.oneOrNone("SELECT * FROM $1~ WHERE "+STREAMER_COL_GAME+"=$2",[GAME_TABLE_NAME,channelName]);
  }
};

module.exports = {
  streamer : streamerFunctions,
  summoners : summonersFunctions,
  game : gameFunctions
};
