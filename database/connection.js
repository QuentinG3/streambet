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
  setStreamerOnLine: function(channelName, viewers) {;
    return db.query("UPDATE $1~ SET " + ONLINE_COL + "=$2, " + VIEWERS_COL + "=$3 WHERE " + CHANNELNAME_COL + "=$4", [STREAMER_TABLE_NAME, true, viewers, channelName]);
  },
  getOnlineStreamers: function() {
    return db.any("SELECT * FROM $1~ WHERE " + ONLINE_COL + "=$2", [STREAMER_TABLE_NAME, true]);
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

var gameFunctions = {
  getGameOfStreamer: function(channelName) {
    return db.oneOrNone("SELECT * FROM $1~ WHERE " + STREAMER_COL_GAME + "=$2", [GAME_TABLE_NAME, channelName]);
  },
  addGame: function(gameId, region, streamer, summonerId, summonerTeam, timestamp) {
    return db.query("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7)", [GAME_TABLE_NAME, gameId, region, streamer, summonerId, summonerTeam, timestamp]);
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
      var requestList = []
      //Adding request to add the game
      requestList.push(t.none("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7)", [GAME_TABLE_NAME, gameId, summonerOfTheGame.region, summonerOfTheGame.channelname, summonerOfTheGame.summonerid, teamOfSummoner, timestamp]))
      //Adding request for the bannedChampion
      for (var i = 0; i < bannedChampionList.length; i++) {
        var bannedChampion = bannedChampionList[i];
        t.none("INSERT INTO $1~ VALUES($2,$3,$4,$5)", [BANNEDCHAMPION_TABLE_NAME, gameId, summonerOfTheGame.region, bannedChampion.name, bannedChampion.teamId]);
      }
      //Adding request for the players of the game
      for (var p = 0; p < playerList.length; p++) {
        var player = playerList[p];
        t.none("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [PLAYER_TABLE_NAME, gameId, summonerOfTheGame.region, player.summonername, player.championname, player.teamid, player.summonerid, player.spell1, player.spell2, player.rank, player.finalMasteryId]);
      }
      return t.batch(requestList);
    });


  }
};
module.exports = {
  streamer: streamerFunctions,
  summoners: summonerFunctions,
  games: gameFunctions,
  bannedChampions: bannedChampionFunctions,
  players: playerFunctions,
  transactions: transactionFunctions
};
