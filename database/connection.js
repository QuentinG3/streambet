/* jshint moz:true */
var pgp = require('pg-promise')();


var cn = "postgresql://quentin:azerty@localhost:5432/streambet";
if (process.env.OPENSHIFT_APP_NAME) {
    cn = process.env.OPENSHIFT_POSTGRESQL_DB_URL + '/' + process.env.OPENSHIFT_APP_NAME;
}
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
const VALID_COL = "valid";
const LASTGAMEID_COL_STREAMERS = "lastgameid";
const LASTGAMEREGION_COL_STREAMERS = "lastgameregion";

var streamerFunctions = {
    getValidStreamers: function(field) {
        return db.any("SELECT $1~ FROM streamers WHERE $2~=$3", [field,VALID_COL,true]);
    },
    setStreamerOffLine: function(channelName) {
        return db.query("UPDATE $1~ SET " + ONLINE_COL + "=$2, " + VIEWERS_COL + "=$3 WHERE " + CHANNELNAME_COL + "=$4", [STREAMER_TABLE_NAME, false, 0, channelName]);
    },
    setStreamerOnLine: function(channelName, viewers) {
        return db.query("UPDATE $1~ SET " + ONLINE_COL + "=$2, " + VIEWERS_COL + "=$3 WHERE " + CHANNELNAME_COL + "=$4", [STREAMER_TABLE_NAME, true, viewers, channelName]);
    },
    getOnlineStreamers: function() {
        return db.any("SELECT * FROM $1~ WHERE " + ONLINE_COL + "=$2 AND ", [STREAMER_TABLE_NAME, true]);
    },
    getOnlineStreamersSorted: function() {
        return db.any("SELECT * FROM $1~ WHERE " + ONLINE_COL + "=$2 ORDER BY " + VIEWERS_COL + " DESC", [STREAMER_TABLE_NAME, true]);
    },
    getStreamerByChannelName: function(channelName) {
        return db.oneOrNone("SELECT * FROM $1~ WHERE " + CHANNELNAME_COL + "=$2", [STREAMER_TABLE_NAME, channelName]);
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
const SUMMONERID_COL_SUMMONERS = "summonerid";

var summonerFunctions = {
    getSummonerOfOnlineValidStreamers: function() {
        return db.any("SELECT * FROM $1~,$2~ WHERE $1~." + STREAMER_COL_SUMMONERS + "=$2~." + CHANNELNAME_COL + " AND $2~." + ONLINE_COL + "=$4 AND $1~.$3~=$4", [SUMMONERS_TABLE_NAME, STREAMER_TABLE_NAME,VALID_COL,true]);
    },

    getSummonerOfStreamer: function(channelname) {
        return db.any("SELECT * FROM $1~ WHERE " + STREAMER_COL_SUMMONERS + "=$2", [SUMMONERS_TABLE_NAME, channelname]);
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
const GAMEID_COL_GAME = "gameid";
const REGION_COL = "region";
const SUMMONERID_COL_GAME = "summonerid";

var gameFunctions = {
    getGameOfStreamer: function(channelName) {
        return db.oneOrNone("SELECT * FROM $1~ WHERE " + STREAMER_COL_GAME + "=$2", [GAME_TABLE_NAME, channelName]);
    },
    addGame: function(gameId, region, streamer, summonerId, summonerTeam, timestamp) {
        return db.query("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7)", [GAME_TABLE_NAME, gameId, region, streamer, summonerId, summonerTeam, timestamp]);
    },
    updateTimeStamp: function(gameId, region, streamer, timestamp) {
        return db.query("UPDATE $1~ SET $7~=$2 WHERE $8~=$3 AND $9~=$4 AND $5~=$6", [GAME_TABLE_NAME, timestamp, gameId, region, STREAMER_COL_GAME, streamer, TIMESTAMP_COL, GAMEID_COL_GAME, REGION_COL]);
    },
    getAllGames: function() {
        return db.any("SELECT * FROM $1~", [GAME_TABLE_NAME]);
    },
    deleteGame: function(gameId, region) {
        return db.query("DELETE FROM $1~ WHERE " + GAMEID_COL_GAME + "=$2 AND " + REGION_COL + "=$3", [GAME_TABLE_NAME, gameId, region]);
    },
    getGameOfStreamerWithSummonerName: function(channelName) {
        return db.oneOrNone("SELECT * FROM $1~,$2~ WHERE $1~." + STREAMER_COL_GAME + "=$3 AND $1~.$4~=$2~.$5~", [GAME_TABLE_NAME, SUMMONERS_TABLE_NAME, channelName, SUMMONERID_COL_GAME, SUMMONERID_COL_SUMMONERS]);
    },
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
const GAMEID_COL_BANNEDCHAMPIONS = "gameid";
const REGION_COL_BANNEDCHAMPIONS = "region";
const STREAMER_COL_BANNEDCHAMPIONS = "streamer";

var bannedChampionFunctions = {
    addBannedChampion: function(gameId, region, name, teamId) {
        return db.query("INSERT INTO $1~ VALUES($2,$3,$4,$5)", [BANNEDCHAMPION_TABLE_NAME, gameId, region, name, teamId]);
    },
    getBannedChampionForGame: function(gameId, region, streamer) {
        return db.any("SELECT*FROM $1~ WHERE $6~=$2 AND $7~=$3 AND $4~=$5", [BANNEDCHAMPION_TABLE_NAME, gameId, region, STREAMER_COL_BANNEDCHAMPIONS, streamer, GAMEID_COL_BANNEDCHAMPIONS, REGION_COL_BANNEDCHAMPIONS]);
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
const GAMEID_COL_PLAYER = "gameid";
const REGION_COL_PLAYER = "region";
const STREAMER_COL_PLAYER = "streamer";

var playerFunctions = {
    addPlayer: function(gameId, region, summonerName, championName, teamId, summonerId, spell1, spell2, rank, finalmasteryId) {
        return db.query("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [PLAYER_TABLE_NAME, gameId, region, summonerName, championName, teamId, summonerId, spell1, spell2, rank, finalmasteryId]);
    },
    getPlayersForGame: function(gameId, region, streamer) {
        return db.any("SELECT * FROM $1~ WHERE $6~=$2 AND $7~=$3 AND $4~=$5", [PLAYER_TABLE_NAME, gameId, region, STREAMER_COL_PLAYER, streamer, GAMEID_COL_PLAYER, REGION_COL_PLAYER]);
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
const DATE_COL = "birthdate";
const PASSWORD_COL = "password";
const MONEY_COL = "money";

var usersFunctions = {
    getUserByEmail: function(email) {
        return db.oneOrNone("SELECT * FROM $1~ WHERE " + EMAIL_COL + "=$2", [USERS_TABLE_NAME, email]);
    },
    getUserByUsername: function(username) {
        return db.oneOrNone("SELECT * FROM $1~ WHERE " + USERNAME_COL + "=$2", [USERS_TABLE_NAME, username]);
    },
    saveUser: function(name, username, hashPassword, email, birthdate) {
        return db.query("INSERT INTO $1~ VALUES($2, $3, $4, $5, $6, date'$7-$8-$9')", [USERS_TABLE_NAME, name, username, hashPassword, email, 500, birthdate.getFullYear(), birthdate.getMonth() + 1, birthdate.getDate()]);
    },
    updateUserEmail: function(username, email) {
        return db.query("UPDATE $1~ SET " + EMAIL_COL + "=$2 WHERE username = $3", [USERS_TABLE_NAME, email, username]);
    },
    updateUserBirthdate: function(username, birthdate) {
        return db.query("UPDATE $1~ SET " + DATE_COL + "=date'$2-$3-$4' WHERE username = $5", [USERS_TABLE_NAME, birthdate.getFullYear(), birthdate.getMonth() + 1, birthdate.getDate(), username]);
    },
    updateUserPassword: function(username, hashPassword) {
        return db.query("UPDATE $1~ SET " + PASSWORD_COL + "=$2 WHERE username = $3", [USERS_TABLE_NAME, hashPassword, username]);
    },
    getBestUser: function() {
        return db.query("SELECT * FROM $1~ ORDER BY " + MONEY_COL + " DESC LIMIT 20", [USERS_TABLE_NAME]);
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
const BETS_TABLE_NAME = "bets";
const GAMEID_COL_BETS = "gameid";
const REGION_COL_BETS = "region";
const USERS_COL_BETS = "users";
const STREAMER_COL_BETS = "streamer";

var betsFunctions = {
    insertBetIfNotAlreadyBet: function(gameId, region, streamer, timeIdWin, amount, username) {
        return db.query("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7)", [BETS_TABLE_NAME, gameId, region, timeIdWin, amount, username, streamer]);
    },
    findBetsForGame: function(gameId, region, streamer) {
        return db.any("SELECT*FROM $1~ WHERE $6~=$2 AND $7~=$3 AND $4~=$5", [BETS_TABLE_NAME, gameId, region, STREAMER_COL_BETS, streamer, GAMEID_COL_BETS, REGION_COL_BETS]);
    }
};

/*
____  ______ _______   _    _ _____  _____ _______ ____  _______     __
|  _ \|  ____|__   __| | |  | |_   _|/ ____|__   __/ __ \|  __ \ \   / /
| |_) | |__     | |    | |__| | | | | (___    | | | |  | | |__) \ \_/ /
|  _ <|  __|    | |    |  __  | | |  \___ \   | | | |  | |  _  / \   /
| |_) | |____   | |    | |  | |_| |_ ____) |  | | | |__| | | \ \  | |
|____/|______|  |_|    |_|  |_|_____|_____/   |_|  \____/|_|  \_\ |_|
*/
const BETHISTORY_TABLE_NAME = "bethistory";
var betHistoryFunctions = {

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
                requestList.push(t.none("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6)", [BANNEDCHAMPION_TABLE_NAME, gameId, summonerOfTheGame.region, bannedChampion.name, bannedChampion.teamid, summonerOfTheGame.channelname]));
            }
            //Adding request for the players of the game
            for (var p = 0; p < playerList.length; p++) {
                var player = playerList[p];
                requestList.push(t.none("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [PLAYER_TABLE_NAME, gameId, summonerOfTheGame.region, player.summonername, player.championname, player.teamid, player.summonerid, player.spell1, player.spell2, player.rank, player.finalmasteryid, summonerOfTheGame.channelname]));
            }

            return t.batch(requestList);
        });
    },

    deleteGameAndProcessBets: function(gameId, region, streamer, gainList) {
        return db.tx(function(t) {
            var requestList = [];

            for (var i = 0; i < gainList.length; i++) {
                oneGain = gainList[i];
                //Updating money of user
                requestList.push(t.query("UPDATE $1~ SET $2~ = $2~ + $3 WHERE $4~ = $5;", [USERS_TABLE_NAME, MONEY_COL, oneGain.gain, USERNAME_COL, oneGain.user]));
                //Creating an history for the bet
                requestList.push(t.query("INSERT INTO $1~ VALUES($2,$3,$4,$5,$6,$7,$8,$9)",[BETHISTORY_TABLE_NAME,gameId,region,oneGain.teamidwin,oneGain.winner,oneGain.amount,oneGain.gain,streamer,oneGain.user]));
            }
            //Update streamer lastgameid and lastgameregion
            requestList.push(t.query("UPDATE $1~ SET $2~=$3,$4~=$5 WHERE $6~=$7 ", [STREAMER_TABLE_NAME,LASTGAMEID_COL_STREAMERS,gameId,LASTGAMEREGION_COL_STREAMERS,region,CHANNELNAME_COL,streamer]));
            //Deleting bets
            requestList.push(t.query("DELETE FROM $1~ WHERE $6~=$2 AND $7~=$3 AND $4~=$5", [BETS_TABLE_NAME, gameId, region, STREAMER_COL_BETS, streamer, GAMEID_COL_BETS, REGION_COL]));
            //Deleting players
            requestList.push(t.query("DELETE FROM $1~ WHERE $6~=$2 AND $7~=$3 AND $4~=$5", [PLAYER_TABLE_NAME, gameId, region, STREAMER_COL_PLAYER, streamer, GAMEID_COL_PLAYER, REGION_COL]));
            //Deleting bannedchampions
            requestList.push(t.query("DELETE FROM $1~ WHERE $6~=$2 AND $7~=$3 AND $4~=$5", [BANNEDCHAMPION_TABLE_NAME, gameId, region, STREAMER_COL_BANNEDCHAMPIONS, streamer, GAMEID_COL_BANNEDCHAMPIONS, REGION_COL]));
            //Deleting game
            requestList.push(t.query("DELETE FROM $1~ WHERE $6~=$2 AND $7~=$3 AND $4~=$5", [GAME_TABLE_NAME, gameId, region, STREAMER_COL_GAME, streamer, GAMEID_COL_GAME, REGION_COL]));

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
    transactions: transactionFunctions,
    users: usersFunctions,
    bets: betsFunctions,
    betHistory : betHistoryFunctions,

};
