//API's
var twitch = require("twitch.tv");
var LolApi = require('./riotApi').getRiotApi();

var async = require("async");
var asyncq = require("async-q");
var Q = require("q");

var database = require('../database/connection');

var streamerUpdate = require('./databaseUpdate/streamerUpdate');
var gameUpdate = require('./databaseUpdate/gameUpdate');
var summonerUpdate = require('./databaseUpdate/summonerUpdate');

//debugs
var UpdateStreamersDatabase = require('debug')('updateStreamersDatabase');
var UpdateStreamerDebug = require('debug')('updateStreamer');
var UpdateCurrentGameDebug = require('debug')('updateCurrentGame');
var doubleLoopDebug = require('debug')('doubleLoop');
var processBetDebug = require('debug')('processBet');

module.exports = {
    updateStreamersDatabase: function(callBackFinal) {

        //Retreive the 25 first streams of league of legneds
        var twitchPromise = Q.denodeify(twitch);
        twitchPromise("streams?game=League%20of%20Legends")
            .then(function(streamData) {

                //Create the string for the request from the retreived only streamers
                var streamerList = "{";

                for (var i = 0; i < streamData.streams.length; i++) {
                    stream = streamData.streams[i];
                    streamerList += "{" + stream.channel.name + "," + stream.viewers + "," + stream.preview + "},";
                }
                streamerList = streamerList.substring(0, streamerList.length - 1);
                streamerList += "}";

                //We add the new streamers found in the database
                database.procedure.updateStreamerDatabase(streamerList)
                    .then(function(sucessUpdateStreamerDatabase) {
                        callBackFinal();
                    }).catch(function(errorUpdateStreamerDatabase) {
                        UpdateStreamersDatabase(errorUpdateStreamerDatabase);
                        callBackFinal();
                    });

            })
            .catch(function(errMessages) {
                UpdateStreamersDatabase(errMessages);
                callBackFinal();
            });
    },
    /*
    Function to update streamers viewers and online in the database by
    requesting the API.
    */
    updateStreamers: function(callbackFinal) {
        //Fetching streamers from database
        database.streamer.getValidStreamers("channelname")
            .then(function(channelNameList) {

                //Execute asyncEach to featch data on each channelName
                var asyncEachNoCallback = Q.denodeify(async.each);
                return asyncEachNoCallback(channelNameList, function(channelNameObj, callbackChannelName) {

                    //Fetach data from twitch API from the channelName
                    var channelName = channelNameObj.channelname;
                    var twitchPromise = Q.denodeify(twitch);


                    twitchPromise("streams/" + channelName)
                        .then(function(streamData) {
                            streamerUpdate.updateStreamer(streamData, channelName, callbackChannelName);
                        })
                        .catch(function(errMessages) {
                            UpdateStreamerDebug(errMessages);
                            callbackChannelName();
                        });
                });
            })
            .then(function() {
                UpdateStreamerDebug("Done updating streamers");
                callbackFinal();
            })
            .catch(function(errorUpdateStream) {
                UpdateStreamerDebug(errorUpdateStream);
                callbackFinal();
            });
    },
    /*
    Function to update the create the new game in which the streamers(summonersName) are. Only one game at a time per streamer.
    (Also used to update timestamp that wasn't set up the first time we check the api)
    */
    updateCurrentGames: function(callbackFinal, io) {

        var championListNoCallback = Q.denodeify(LolApi.Static.getChampionList);
        var championListPromise = championListNoCallback({
            dataById: true
        });

        var spellListNoCallback = Q.denodeify(LolApi.Static.getSummonerSpellList);
        var spellListPromise = spellListNoCallback({
            dataById: true
        });

        var GetGameApiNoCallBack = Q.denodeify(LolApi.getCurrentGame);

        database.summoners.getSummonerOfOnlineValidStreamers().then(function(summonersOfOnlineStreamersList) {
                //Execute asyncEach loop throught the summoners of onlineStreamerList
                var asyncEachPromise = Q.denodeify(async.each);
                asyncEachPromise(summonersOfOnlineStreamersList, updateCurrentGameForSummoners)
                    .then(function() {
                        UpdateCurrentGameDebug("Done with updateCurrentGame");
                        callbackFinal();
                    })
                    .catch(function(asyncEachError) {
                        UpdateCurrentGameDebug(asyncEachError);
                        callbackFinal();
                    });
            })
            .catch(function(summonersOFOnlineStreamersError) {
                UpdateCurrentGameDebug(summonersOFOnlineStreamersError);
                callbackFinal();
            });


        //This function is the callback of the asyncEach above
        var updateCurrentGameForSummoners = function(summonerOfOnlineStreamer, callbackSummonerOfOnlineStreamer) {

            //First we look in the database if the user is in a game already
            database.games.getGameOfStreamer(summonerOfOnlineStreamer.channelname)
                .then(function(gameOfTheStreamer) {

                    //If the users isn't in a game we keep going to look if he's in a game in the API right now
                    if (!gameOfTheStreamer) {

                        UpdateCurrentGameDebug("No game found in DB for " + summonerOfOnlineStreamer.summonersname);

                        //We get the game from the API
                        GetGameApiNoCallBack(summonerOfOnlineStreamer.summonerid, summonerOfOnlineStreamer.region)
                            .then(function(gameFromApi) {

                                UpdateCurrentGameDebug("Game found in API for " + summonerOfOnlineStreamer.summonersname);
                                //We create a new game with the informations gotten from the api
                                //If the game id is the same as the last game id it mean the api was not updated yet so we don't do anything
                                if (summonerOfOnlineStreamer.lastgameid == gameFromApi.gameId && summonerOfOnlineStreamer.lastgameregion == summonerOfOnlineStreamer.region) {

                                    UpdateCurrentGameDebug("Old game not deleted from the API yet: Not adding game to database anymore for " + summonerOfOnlineStreamer.channelname);
                                    callbackSummonerOfOnlineStreamer();
                                } else {
                                    //We update the summonersName from the summoners id
                                    summonerUpdate.updateSummonersNameFromApiBySummonersId(summonerOfOnlineStreamer.summonerid, summonerOfOnlineStreamer.region)
                                        .then(function(result) {
                                            gameUpdate.createNewGame(gameFromApi, summonerOfOnlineStreamer, spellListPromise, championListPromise, io, callbackSummonerOfOnlineStreamer);
                                        }).catch(function(error) {
                                            UpdateCurrentGameDebug(summonerOfOnlineStreamer.summonersname + ' could not update the summmonersName from the summonerId in api' + error);
                                            callbackSummonerOfOnlineStreamer();
                                        });
                                }
                            })
                            .catch(function(errorGettingGameFromApi) {
                                if (errorGettingGameFromApi != "Error: Error getting current game: 404 Not Found") {

                                    UpdateCurrentGameDebug("Error other than game not found : " + errorGettingGameFromApi);

                                    callbackSummonerOfOnlineStreamer();
                                } else {
                                    UpdateCurrentGameDebug(summonerOfOnlineStreamer.summonersname + " not in a game in API currently");

                                    callbackSummonerOfOnlineStreamer();
                                }
                            });


                        //If the user is in the game but the timestamp isn't set yet we try to get in from the api
                    } else if (gameOfTheStreamer.timestamp === "0") {

                        //We get the game from the api to get the timestamp
                        GetGameApiNoCallBack(summonerOfOnlineStreamer.summonerid, summonerOfOnlineStreamer.region)
                            .then(function(gameFromApi) {

                                //If the timestamp is set we update it
                                if (gameFromApi.gameStartTime !== 0) {
                                    UpdateCurrentGameDebug("Updating timestamp for " + summonerOfOnlineStreamer.channelname);
                                    gameUpdate.updateTimeStamp(gameOfTheStreamer, gameFromApi.gameStartTime, summonerOfOnlineStreamer.channelname, io, callbackSummonerOfOnlineStreamer);
                                }
                                //If it isn't set yet we just go to the next summoners to update
                                else {
                                    UpdateCurrentGameDebug("TimeStamp still not available in API for " + summonerOfOnlineStreamer.channelname);
                                    callbackSummonerOfOnlineStreamer();
                                }
                            })
                            .catch(function(errorGettingGameFromApi) {
                                if (errorGettingGameFromApi != "Error: Error getting current game: 404 Not Found") {

                                    UpdateCurrentGameDebug("Error other than game not found : " + errorGettingGameFromApi);

                                    callbackSummonerOfOnlineStreamer();
                                } else {
                                    UpdateCurrentGameDebug(summonerOfOnlineStreamer.summonersname + " check api for another summoenrs that hasn't timestamp set yet");

                                    callbackSummonerOfOnlineStreamer();
                                }
                            });
                    } else {
                        UpdateCurrentGameDebug(summonerOfOnlineStreamer.channelname + " already in a game in DB");
                        callbackSummonerOfOnlineStreamer();
                    }
                })
                .catch(function(errorGettingGameOfStreamer) {
                    UpdateCurrentGameDebug(errorGettingGameOfStreamer);
                    callbackSummonerOfOnlineStreamer();
                });
        };
    },
    /*Function that check the game currently in the database to see if there are over.
    If there are done give the reward to those who bet on it and take the points from those that lose the bet
    */
    processBet: function(callbackFinal, io) {
        //We get all the current games in the database
        database.games.getAllGames()
            .then(function(allCurrentGames) {
                var asyncEachPromise = Q.denodeify(async.each);
                asyncEachPromise(allCurrentGames, getResultsOfMatchs)
                    .then(function() {
                        processBetDebug("All bets processed");
                        callbackFinal();
                    }).
                catch(function(asyncEachError) {
                    processBetDebug(asyncEachError);
                    callbackFinal();
                });

            })
            .catch(function(errorGettingCurrentGames) {
                processBetDebug(errorGettingCurrentGames);
                callbackFinal();
            });

        //Function of the asycn each call abvoe for each item
        var getResultsOfMatchs = function(currentGame, callBackResultOfMatch) {

            //We try to get the result of the match
            var getMatchResultNoCallback = Q.denodeify(LolApi.getMatch);
            getMatchResultNoCallback(currentGame.gameid, false, currentGame.region)
                .then(function(gameApi) {

                    //Getting the id of the winning team
                    var winnerTeamId = -1;
                    for (var i = 0; i < gameApi.teams.length; i++) {
                        var team = gameApi.teams[i];
                        if (team.winner) {
                            winnerTeamId = team.teamId;
                        }
                    }

                    database.bets.findBetsForGame(currentGame.gameid, currentGame.region, currentGame.streamer)
                        .then(function(betsForCurrentGame) {
                            var gainList = [];
                            amount100 = 0;
                            amount200 = 0;
                            if (betsForCurrentGame.length != 1) {
                                //We compute the total bet amount for each team


                                for (var j = 0; j < betsForCurrentGame.length; j++) {
                                    oneBet = betsForCurrentGame[j];
                                    if (oneBet.teamidwin == "100") {
                                        amount100 += oneBet.amount;
                                    }
                                    if (oneBet.teamidwin == "200") {
                                        amount200 += oneBet.amount;
                                    }
                                }

                                //Computing gain and lose for all user that bet on the game
                                for (var k = 0; k < betsForCurrentGame.length; k++) {
                                    oneBet = betsForCurrentGame[k];
                                    if (winnerTeamId == oneBet.teamidwin) {
                                        if (winnerTeamId == "100") {
                                            gainAmount = (oneBet.amount / amount100) * amount200;
                                        } else {
                                            gainAmount = (oneBet.amount / amount200) * amount100;
                                        }
                                    } else {
                                        gainAmount = -1 * (oneBet.amount);
                                    }

                                    gainList.push({
                                        user: oneBet.users,
                                        gain: gainAmount,
                                        teamidwin: oneBet.teamidwin,
                                        winner: winnerTeamId,
                                        amount: oneBet.amount
                                    });
                                }
                            } else {
                                processBetDebug("Only one bet was made for streamer " + currentGame.streamer + " : No bets to process");
                                oneBet = betsForCurrentGame[0];
                                gainList.push({
                                    user: oneBet.users,
                                    gain: 0,
                                    teamidwin: oneBet.teamidwin,
                                    winner: winnerTeamId,
                                    amount: oneBet.amount
                                });
                            }


                            //Now we start a transaction to give the gain or loose to player and delete the game(with the players and bannedchampions)
                            database.transactions.deleteGameAndProcessBets(currentGame.gameid, currentGame.region, currentGame.streamer, gainList)
                                .then(function() {
                                    processBetDebug("Game fully deleted and bet process for game of " + currentGame.streamer);
                                    io.to(currentGame.streamer).emit('finishedGame', {
                                        winner: winnerTeamId,
                                        amount100: amount100,
                                        amount200: amount200
                                    });
                                    callBackResultOfMatch();

                                })
                                .catch(function(errorTransctionDeleteGameAndProcessBets) {
                                    processBetDebug(errorTransctionDeleteGameAndProcessBets);
                                    callBackResultOfMatch();
                                });



                        })
                        .catch(function(errorGettingBets) {
                            processBetDebug(errorGettingBets);
                            callBackResultOfMatch();

                        });
                })
                .catch(function(errorGettingResult) {
                    if (errorGettingResult != "Error: Error getting match: 404 Not Found") {
                        processBetDebug("Error other than game not found : " + errorGettingResult);

                        callBackResultOfMatch();
                    } else {
                        processBetDebug(currentGame.streamer + " 's game is not finished yet'");

                        callBackResultOfMatch();
                    }
                });
        };
    }
};
