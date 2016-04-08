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
  getStreamers: function(field) {
    return db.any("SELECT $1~ FROM streamers", field);
  },
  setStreamerOffLine: function(channelName) {
    return db.query("UPDATE $1~ SET " + ONLINE_COL + "=$2, " + VIEWERS_COL + "=$3 WHERE " + CHANNELNAME_COL + "=$4", [STREAMER_TABLE_NAME, false, 0, channelName]);
  },
  setStreamerOnLine: function(channelName, viewers) {
    return db.query("UPDATE $1~ SET " + ONLINE_COL + "=$2, " + VIEWERS_COL + "=$3 WHERE " + CHANNELNAME_COL + "=$4", [STREAMER_TABLE_NAME, true, viewers, channelName]);
  },
  getOnlineStreamers: function() {
    return db.any("SELECT * FROM $1~ WHERE " + ONLINE_COL + "=$2", [STREAMER_TABLE_NAME, true]);
  },
  getStreamerByChannelName: function(channelName){
    return db.one("SELECT * FROM $1~ WHERE "+CHANNELNAME_COL+"=$2",[STREAMER_TABLE_NAME,channelName]);
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

var summonerFunctions = {
  getSummonerOfOnlineStreamers: function() {
    return db.any("SELECT * FROM $1~,$2~ WHERE $1~." + STREAMER_COL_SUMMONERS + "=$2~." + CHANNELNAME_COL + " AND $2~." + ONLINE_COL + "=true", [SUMMONERS_TABLE_NAME, STREAMER_TABLE_NAME]);
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

const GAME_TABLE_NAME = "games";
const STREAMER_COL_GAME = "streamer";
const TIMESTAMP_COL = "timestamp";
const GAMEID_COL = "gameid";
const REGION_COL = "region";

var gameFunctions = {
  getGameOfStreamer: function(channelName) {
    return db.oneOrNone("SELECT * FROM $1~ WHERE " + STREAMER_COL_GAME + "=$2", [GAME_TABLE_NAME, channelName]);
  },
  addGame: function(gameId, region, streamer, summonerId, summonerTeam, timestamp) {
    return db.query("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7)", [GAME_TABLE_NAME, gameId, region, streamer, summonerId, summonerTeam, timestamp]);
  },
  updateTimeStamp: function(gameId,region,timestamp){
    return db.query("UPDATE $1~ SET " + TIMESTAMP_COL + "=$2 WHERE " + GAMEID_COL + "=$3 AND "+REGION_COL+"=$4", [GAME_TABLE_NAME, timestamp, gameId, region]);
  },
  getAllGames : function(){
    return db.query("SELECT * FROM $1~", [GAME_TABLE_NAME]);
  },
  deleteGame : function(gameId,region){
    return db.query("DELETE FROM $1~ WHERE "+GAMEID_COL+"=$2 AND "+REGION_COL+"=$3", [GAME_TABLE_NAME,gameId,region]);
  }
};

/*
____          _   _ _   _ ______ _____     _____ _    _          __  __ _____ _____ ____  _   _  _____
|  _ \   /\   | \ | | \ | |  ____|  __ \   / ____| |  | |   /\   |  \/  |  __ \_   _/ __ \| \ | |/ ____|
| |_) | /  \  |  \| |  \| | |__  | |  | | | |    | |__| |  /  \  | \  / | |__) || || |  | |  \| | (___
|  _ < / /\ \ | . ` | . ` |  __| | |  | | | |    |  __  | / /\ \ | |\/| |  ___/ | || |  | | . ` |\___ \
| |_) / ____ \| |\  | |\  | |____| |__| | | |____| |  | |/ ____ \| |  | | |    _| || |__| | |\  |____) |
|____/_/    \_\_| \_|_| \_|______|_____/   \_____|_|  |_/_/    \_\_|  |_|_|   |_____\____/|_| \_|_____/



*/
const BANNEDCHAMPION_TABLE_NAME = "bannedchampions";

var bannedChampionFunctions = {
  addBannedChampion: function(gameId, region, name, teamId) {
    return db.query("INSERT INTO $1~ VALUES($2,$3,$4,$5)", [BANNEDCHAMPION_TABLE_NAME, gameId, region, name, teamId]);
  }
};

/*
_____  _           __     ________ _____   _____
|  __ \| |        /\\ \   / /  ____|  __ \ / ____|
| |__) | |       /  \\ \_/ /| |__  | |__) | (___
|  ___/| |      / /\ \\   / |  __| |  _  / \___ \
| |    | |____ / ____ \| |  | |____| | \ \ ____) |
|_|    |______/_/    \_\_|  |______|_|  \_\_____/
*/
const PLAYER_TABLE_NAME = "players";

var playerFunctions = {
  addPlayer: function(gameId, region, summonerName, championName, teamId, summonerId, spell1, spell2, rank, finalmasteryId) {
    return db.query("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [PLAYER_TABLE_NAME, gameId, region, summonerName, championName, teamId, summonerId, spell1, spell2, rank, finalmasteryId]);
  }
};
/*
_______ _____            _   _  _____         _____ _______ _____ ____  _   _  _____
|__   __|  __ \     /\   | \ | |/ ____|  /\   / ____|__   __|_   _/ __ \| \ | |/ ____|
  | |  | |__) |   /  \  |  \| | (___   /  \ | |       | |    | || |  | |  \| | (___
  | |  |  _  /   / /\ \ | . ` |\___ \ / /\ \| |       | |    | || |  | | . ` |\___ \
  | |  | | \ \  / ____ \| |\  |____) / ____ \ |____   | |   _| || |__| | |\  |____) |
  |_|  |_|  \_\/_/    \_\_| \_|_____/_/    \_\_____|  |_|  |_____\____/|_| \_|_____/
*/

var transactionFunctions = {
  addEntierGameTransaction: function(gameId, summonerOfTheGame, teamOfSummoner, timestamp, playerList, bannedChampionList) {
    return db.tx(function(t) {
      var requestList = [];
      //Adding request to add the game
      requestList.push(t.none("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7)", [GAME_TABLE_NAME, gameId, summonerOfTheGame.region, summonerOfTheGame.channelname, summonerOfTheGame.summonerid, teamOfSummoner, timestamp]));
      //Adding request for the bannedChampion
      for (var i = 0; i < bannedChampionList.length; i++) {
        var bannedChampion = bannedChampionList[i];
        requestList.push(t.none("INSERT INTO $1~ VALUES($2,$3,$4,$5)", [BANNEDCHAMPION_TABLE_NAME, gameId, summonerOfTheGame.region, bannedChampion.name, bannedChampion.teamId]));
      }
      //Adding request for the players of the game
      for (var p = 0; p < playerList.length; p++) {
        var player = playerList[p];
        requestList.push(t.none("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [PLAYER_TABLE_NAME, gameId, summonerOfTheGame.region, player.summonerName, player.championName, player.teamId, player.summonerId, player.spell1, player.spell2, player.rank, player.finalMasteryId]));
      }

      return t.batch(requestList);
    });
  },
  deleteGameAndProcessBets : function(gameId,region){
    return db.tx(function(t) {
      var requestList = [];

      //Deleting players
      t.query("DELETE FROM $1~ WHERE "+GAMEID_COL+"=$2 AND "+REGION_COL+"=$3", [PLAYER_TABLE_NAME,gameId,region]);
      //Deleting bannedchampions
      t.query("DELETE FROM $1~ WHERE "+GAMEID_COL+"=$2 AND "+REGION_COL+"=$3", [BANNEDCHAMPION_TABLE_NAME,gameId,region]);
      //Deleting game
      t.query("DELETE FROM $1~ WHERE "+GAMEID_COL+"=$2 AND "+REGION_COL+"=$3", [GAME_TABLE_NAME,gameId,region]);

      return t.batch(requestList);
    });
  }
};

/*
_    _  _____ ______ _____   _____
| |  | |/ ____|  ____|  __ \ / ____|
| |  | | (___ | |__  | |__) | (___
| |  | |\___ \|  __| |  _  / \___ \
| |__| |____) | |____| | \ \ ____) |
\____/|_____/|______|_|  \_\_____/
*/
const USERS_TABLE_NAME = "users";
const USERNAME_COL = "username";
const EMAIL_COL = "email";

var usersFunctions = {
  getUserByEmail : function(email){
    return db.oneOrNone("SELECT * FROM $1~ WHERE " + EMAIL_COL + "=$2", [USERS_TABLE_NAME, email]);
  },
  getUserByUsername : function(username){
    return db.oneOrNone("SELECT * FROM $1~ WHERE " + USERNAME_COL + "=$2", [USERS_TABLE_NAME, username]);
  }
};

/*
____  ______ _______ _____
|  _ \|  ____|__   __/ ____|
| |_) | |__     | | | (___
|  _ <|  __|    | |  \___ \
| |_) | |____   | |  ____) |
|____/|______|  |_| |_____/
*/

var betsFunctions = {
  createBet : function(gameId,region,timeIdWin,amount){

  }
};

module.exports = {
  streamer: streamerFunctions,
  summoners: summonerFunctions,
  games: gameFunctions,
  bannedChampions: bannedChampionFunctions,
  players: playerFunctions,
  transactions: transactionFunctions,
  users: usersFunctions,
  bets: betsFunctions

};
