/* jshint moz:true */
var LolApi = require('leagueapi');
var Q = require("q");

var database = require('../../database/connection');

var ia = require('./ia');



//debugs
var UpdateCurrentGameDebug = require('debug')('updateCurrentGame');


const FINAL_MASTERIES_LIST = [6161, 6162, 6164, 6261, 6262, 6263, 6361, 6362, 6363];
const ALLOWED_QUEUE_TYPE = [4, 410];

var createNewGame = function(gameFromApi, summonerOfOnlineStreamer, spellListPromise, championListPromise, smallLimitAPI, bigLimitAPI, io, callbackSummonerOfOnlineStreamer) {

    //We first check if the game is played in a ranked mode
    if (ALLOWED_QUEUE_TYPE.indexOf(gameFromApi.gameQueueConfigId) != -1) {

        //We first get the static api's
        championListPromise.then(function(listChampion) {
                spellListPromise.then(function(listSpell) {

                        //Getting the team of the summoner
                        var summonerTeam = -1;
                        for (var i = 0; i < gameFromApi.participants.length; i++) {
                            var participant = gameFromApi.participants[i];
                            if (participant.summonerId == summonerOfOnlineStreamer.summonerid) {
                                summonerTeam = participant.teamId;
                            }
                        }

                        //Getting the bannedChampions
                        var bannedChampionList = [];
                        for (var j = 0; j < gameFromApi.bannedChampions.length; j++) {
                            var bannedChampion = gameFromApi.bannedChampions[j];
                            bannedChampionList.push({
                                name: listChampion.data[bannedChampion.championId].key,
                                teamid: bannedChampion.teamId
                            });
                        }

                        //Creating string of summonersId from Ranking Query
                        var sumIdsString = "";
                        for (var k = 0; k < gameFromApi.participants.length; k++) {
                            sumIdToadd = gameFromApi.participants[k].summonerId;
                            sumIdsString += sumIdToadd + ",";
                        }

                        //Request the ranks to the API
                        var playerList = [];
                        smallLimitAPI.removeTokens(1, function(err, remainingRequestsSmall) {
                            bigLimitAPI.removeTokens(1, function(err, remainingRequestsBig) {
                                var rankingsNoCallback = Q.denodeify(LolApi.getLeagueEntryData);
                                rankingsNoCallback(sumIdsString, summonerOfOnlineStreamer.region)
                                    .then(function(rankings) {

                                        //We get the final masteries of all the players of the game
                                        for (var l = 0; l < gameFromApi.participants.length; l++) {
                                            var participant = gameFromApi.participants[l];

                                            var finalMastery = -1;

                                            //Getting the masteries of one player
                                            for (var m = 0; m < participant.masteries.length; m++) {
                                                mastery = participant.masteries[m];
                                                if (FINAL_MASTERIES_LIST.indexOf(mastery.masteryId) != -1) {
                                                    finalMastery = mastery.masteryId;
                                                }
                                            }

                                            //Getting rank of the player
                                            var playerRank = "UNRANKED";
                                            if (rankings[participant.summonerId] !== undefined) {
                                                for (var n = 0; n < rankings[participant.summonerId].length; n++) {
                                                    if (rankings[participant.summonerId][n].queue == "RANKED_SOLO_5x5") {
                                                        playerRank = rankings[participant.summonerId][n].tier;
                                                    }
                                                }
                                            }

                                            //We create the player
                                            playerList.push({
                                                summonername: participant.summonerName,
                                                summonerid: participant.summonerId,
                                                teamid: participant.teamId,
                                                championname: listChampion.data[participant.championId].key,
                                                spell1: listSpell.data[participant.spell1Id].key,
                                                spell2: listSpell.data[participant.spell2Id].key,
                                                rank: playerRank,
                                                finalmasteryid: finalMastery,
                                            });

                                        }
                                        //Starting the transaction to save the gaem
                                        database.transactions.addEntierGameTransaction(gameFromApi.gameId, summonerOfOnlineStreamer, summonerTeam, gameFromApi.gameStartTime, playerList, bannedChampionList)
                                            .then(function() {
                                                //Prepring the game to send to the socket
                                                var gameToSend = {
                                                    players: playerList,
                                                    bannedChampions: bannedChampionList,
                                                    region: summonerOfOnlineStreamer.region,
                                                    summonerName: summonerOfOnlineStreamer.summonersname,
                                                    teamOfSummoner: summonerTeam,
                                                    timestamp: gameFromApi.gameStartTime
                                                };

                                                //Sending the game to the socket
                                                io.to(summonerOfOnlineStreamer.channelname).emit('game', {
                                                    game: gameToSend,
                                                    betTeam: 0,
                                                    betAmount: 0,
                                                    amount100: 0,
                                                    amount200: 0
                                                });

                                                UpdateCurrentGameDebug("Game added to the database for summoner " + summonerOfOnlineStreamer.summonersname);


                                                ia.placeBetForRandomUsers(gameFromApi.gameId, summonerOfOnlineStreamer.region, summonerOfOnlineStreamer.channelname, io, gameToSend.timestamp, callbackSummonerOfOnlineStreamer);


                                                callbackSummonerOfOnlineStreamer();
                                            })
                                            .catch(function(errorTransactionCreateGame) {
                                                UpdateCurrentGameDebug(errorTransactionCreateGame);
                                                callbackSummonerOfOnlineStreamer();
                                            });
                                    })
                                    .catch(function(errorGettingRankings) {
                                        UpdateCurrentGameDebug(errorGettingRankings);
                                        callbackSummonerOfOnlineStreamer();
                                    });
                            }); //END BIGLIMITAPI
                        }); //END SMALLLIMITAPI

                    })
                    .catch(function(errorSpellApi) {
                        UpdateCurrentGameDebug(errorSpellApi);
                        callbackSummonerOfOnlineStreamer();
                    });

            })
            .catch(function(errorChampionApi) {
                UpdateCurrentGameDebug(errorChampionApi);
                callbackSummonerOfOnlineStreamer();
            });
    } else {
        UpdateCurrentGameDebug(summonerOfOnlineStreamer.summonersname + " not in a mode other than ranked queue");
        callbackSummonerOfOnlineStreamer();
    }
};



var updateTimeStamp = function(gameOfTheStreamer, timeStamp, channelname, io, callbackSummonerOfOnlineStreamer) {

    //Update timestamp of the game gameOfTheStreamer with timestamp
    database.games.updateTimeStamp(gameOfTheStreamer.gameid, gameOfTheStreamer.region, gameOfTheStreamer.streamer, timeStamp)
        .then(function() {
            io.to(channelname).emit('timeStamp', {
                timeStamp: timeStamp
            });
            callbackSummonerOfOnlineStreamer();
        })
        .catch(function(errorUpdateTimestamp) {
            UpdateCurrentGameDebug(errorUpdateTimestamp);
            callbackSummonerOfOnlineStreamer();
        });

};

module.exports = {
    createNewGame: createNewGame,
    updateTimeStamp: updateTimeStamp
};
