var Game = require('../../models/Game');
var LolApi = require('leagueapi');
var Q = require("q");

var database = require('../../database/connection');

//debugs
var UpdateCurrentGameDebug = require('debug')('updateCurrentGame');


FINAL_MASTERIES_LIST = [6161, 6162, 6164, 6261, 6262, 6263, 6361, 6362, 6363];
ALLOWED_QUEUE_TYPE = [4, 410];

var createNewGame = function(gameFromApi, summonerOfOnlineStreamer, spellListPromise, championListPromise, smallLimitAPI, bigLimitAPI, io, callbackSummonerOfOnlineStreamer) {
  if (ALLOWED_QUEUE_TYPE.indexOf(gameFromApi.gameQueueConfigId) != -1) {
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
                teamId: bannedChampion.teamId
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
                    for (var l = 0; l < gameFromApi.participants.length; l++) {
                      var participant = gameFromApi.participants[l];

                      var finalMastery = -1;

                      //Getting the masteries of the player
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

                      playerList.push({
                        summonerName: participant.summonerName,
                        summonerId: participant.summonerId,
                        teamId: participant.teamId,
                        championName: listChampion.data[participant.championId].key,
                        spell1: listSpell.data[participant.spell1Id].key,
                        spell2: listSpell.data[participant.spell2Id].key,
                        rank: playerRank,
                        finalMasteryId: finalMastery,
                      });



                    }
                    //Starting the transaction to save the gaem
                    database.transactions.addEntierGameTransaction(gameFromApi.gameId, summonerOfOnlineStreamer, summonerTeam, gameFromApi.gameStartTime, playerList, bannedChampionList)
                      .then(function() {
                        var gameToSend = {
                          players: playerList,
                          bannedChampions: bannedChampionList,
                          region: summonerOfOnlineStreamer.region,
                          summonerName: summonerOfOnlineStreamer.summonersname,
                          teamOfSummoner: summonerTeam,
                          timestamp: gameFromApi.gameStartTime
                        };
                        io.to(summonerOfOnlineStreamer.channelname).emit('game', {
                          game: gameToSend,
                          betTeam: 0,
                          betAmount: 0,
                          amount100: 0,
                          amount200: 0
                        });
                        UpdateCurrentGameDebug("Game added to the database for summoner " + summonerOfOnlineStreamer.summonersname);
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
      .catch(function(errorChampionAPI) {
        UpdateCurrentGameDebug(errorChampionAPI);
        callbackSummonerOfOnlineStreamer();
      });
  } else {
    UpdateCurrentGameDebug(summonerOfOnlineStreamer.summonersname + " not in a mode other than ranked queue");
    callbackSummonerOfOnlineStreamer();
  }
};



var updateTimeStamp = function(err, currentGame, oneGame, callback, streamer, summonersName, io) {
  if (err) {
    callback();
    return console.error("Error when updating timestamp of a game (API request error?)", err);
  }
  Game.findByIdAndUpdate(oneGame['_id'], {
    $set: {
      timestamp: currentGame['gameStartTime']
    }
  }, function(err) {
    if (err) {
      callback();
      return console.error("error when updateing the timestamp", error);
    }
    io.to(streamer['channelName']).emit('timeStamp', {
      timeStamp: currentGame['gameStartTime']
    });
    UpdateCurrentGameDebug("Updated timestamp for " + streamer['name'] + " " + summonersName['name'] + " (might still be 0)");
    callback();
  });
}

module.exports = {
  createNewGame: createNewGame,
  updateTimeStamp: updateTimeStamp
};
