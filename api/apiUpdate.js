//API's
var twitch = require("twitch.tv");
var LolApi = require('leagueapi');

var async = require("async");
var asyncq = require("async-q");
var Q = require("q");

//Models import
var Streamer = require('../models/Streamer');
var Game = require('../models/Game');
var Bet = require('../models/Bet');
var User = require('../models/User');

var database = require('../database/connection');

var streamerUpdate = require('./databaseUpdate/streamerUpdate');
var gameUpdate = require('./databaseUpdate/gameUpdate');

//debugs
var UpdateStreamerDebug = require('debug')('updateStreamer');
var UpdateCurrentGameDebug = require('debug')('updateCurrentGame');
var doubleLoopDebug = require('debug')('doubleLoop');
var processBetDebug = require('debug')('processBet');


//Quentin API
//LolApi.init("0f161ba9-ce84-42ab-b53d-2dbe14dd2f83");
//Nicolas API
LolApi.init("3237f591-a76d-4643-a49e-bc08be9a638b");



module.exports = {
  /*
  Function to update streamers viewers and online in the database by
  requesting the API.
  */
  updateStreamers: function(callbackFinal) {
    //Fetching streamers from database
    database.streamer.getStreamers(["channelname"])
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
  updateCurrentGames: function(callbackFinal, smallLimitAPI, bigLimitAPI, io) {
    var summonersOfOnlineStreamersPromise = database.summoners.getSummonerOfOnlineStreamers();

    var championListNoCallback = Q.denodeify(LolApi.Static.getChampionList);
    var championListPromise = championListNoCallback({
      dataById: true
    });

    var spellListNoCallback = Q.denodeify(LolApi.Static.getSummonerSpellList);
    var spellListPromise = spellListNoCallback({
      dataById: true
    });

    var GetGameApiNoCallBack = Q.denodeify(LolApi.getCurrentGame);


    summonersOfOnlineStreamersPromise.then(function(summonersOfOnlineStreamersList) {
        //Execute asyncEach loop throught the summoners of onlineStreamerList
        var asyncEachPromise = Q.denodeify(async.each);
        return asyncEachPromise(summonersOfOnlineStreamersList, updateCurrentGameForSummoners);
      })
      .then(function() {
        UpdateCurrentGameDebug("Done with updateCurrentGame");
        callbackFinal();
      })
      .catch(function(onlineStreamerError) {
        UpdateCurrentGameDebug(onlineStreamerError);
        callbackFinal();
      });

    var updateCurrentGameForSummoners = function(summonerOfOnlineStreamer, callbackSummonerOfOnlineStreamer) {
      database.games.getGameOfStreamer(summonerOfOnlineStreamer.channelname)
        .then(function(gameOfTheStreamer) {
          if (!gameOfTheStreamer) {
            UpdateCurrentGameDebug("No game found in DB for " + summonerOfOnlineStreamer.summonersname);
            smallLimitAPI.removeTokens(1, function(err, remainingRequestsSmall) {
              bigLimitAPI.removeTokens(1, function(err, remainingRequestsBig) {
                GetGameApiNoCallBack(summonerOfOnlineStreamer.summonerid, summonerOfOnlineStreamer.region)
                  .then(function(gameFromApi) {
                    UpdateCurrentGameDebug("Game found in API for " + summonerOfOnlineStreamer.summonersname);
                    gameUpdate.createNewGame(gameFromApi, summonerOfOnlineStreamer, spellListPromise, championListPromise, smallLimitAPI, bigLimitAPI, io, callbackSummonerOfOnlineStreamer);
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
              });
            });
          } else if (gameOfTheStreamer.timestamp === 0) {
            UpdateCurrentGameDebug("Updating timestamp for " + summonerOfOnlineStreamer.channelname);
            callbackSummonerOfOnlineStreamer();
          } else {
            UpdateCurrentGameDebug(summonerOfOnlineStreamer.channelname + "already in a game in DB");
            callbackSummonerOfOnlineStreamer();
          }
        })
        .catch(function(errorGettingGameOfStreamer) {
          UpdateCurrentGameDebug(errorGettingGameOfStreamer);
        });
    };
  },
  /*Function that check the game currently in the database to see if there are over.
  If there are done give the reward to those who bet on it and take the points from those that lose the bet
  */
  processBet: function(callbackFinal, smallLimitAPI, bigLimitAPI, io) {
    /*
        Game.find({}, function(err, gameList) {
          async.each(gameList, function(game, callbackGame) {
            smallLimitAPI.removeTokens(1, function(err, remainingRequestsSmall) {
              bigLimitAPI.removeTokens(1, function(err, remainingRequestsBig) {
                LolApi.getMatch(game['gameId'], false, game['region'], function(err, gameApi) {
                  if (err != "Error: Error getting match: 404 Not Found" && err != null) {
                    processBetDebug(err);
                  }
                  if (gameApi != undefined) {
                    var winnerTeamId = -1;
                    for (var i = 0; i < gameApi['teams'].length; i++) {
                      var team = gameApi['teams'][i];
                      if (team['winner']) {
                        winnerTeamId = team['teamId'];
                      }
                    }
                    processBetDebug("Game with game id " + game['gameId'] + " is done with winner " + winnerTeamId);

                    //Winning team is in var winnerTeamId
                    //HERE PROCESS BETS....
                    Bet.find({
                      game: game['_id']
                    }, function(errorBets, allBets) {
                      totalAmount100 = 0;
                      totalAmount200 = 0;
                      for (var i = 0; i < allBets.length; i++) {
                        oneBet = allBets[i];
                        if (oneBet['teamIdWin'] == 100) {
                          totalAmount100 += oneBet['amount'];
                        } else if (oneBet['teamIdWin'] == 200) {
                          totalAmount200 += oneBet['amount'];
                        }
                      }

                      processBetDebug("TotalAmount100 = " + totalAmount100);
                      processBetDebug("TotalAmount200 = " + totalAmount200);

                      async.each(allBets, function(singleBet, callbackBet) {
                        gainAmount = 0;
                        amountBet = singleBet['amount'];
                        processBetDebug("AmountBet = " + amountBet);
                        processBetDebug("teamIdWin = " + singleBet['teamIdWin']);
                        if (winnerTeamId == singleBet['teamIdWin']) {
                          if (winnerTeamId == "100") {
                            gainAmount = Math.ceil((amountBet / totalAmount100) * totalAmount200);
                          } else {
                            gainAmount = Math.ceil((amountBet / totalAmount200) * totalAmount100);
                          }

                          else{
                            if(singleBet['teamIdWin'] == "100"){
                              if(totalAmount200 > 0)
                                gainAmount = (amountBet*-1);
                              else
                                gainAmount = 0;
                            }else{
                              if(totalAmount100 > 0)
                                gainAmount = (amountBet*-1);
                              else
                                gainAmount = 0;
                            }
                          }
                        }, function(errorUpdateEloUser) {
                          callbackBet();

                        });

                      }, function(errAsyncBet) {
                        //Remove bets
                        Bet.remove({
                          game: game['_id']
                        }, function(errorBetsRemove) {
                          processBetDebug("Bets removed");

                            Game.remove({_id:game['_id']},function(err,removed){
                              if(err) return console.error('error when deleting game',error);
                              io.to(game['channelName']).emit('finishedGame',{
                                winner:winnerTeamId,
                                amount100:totalAmount100,
                                amount200:totalAmount200});
                              processBetDebug("Game with id "+ game['gameId'] + " removed from database");
                              callbackGame();

                            });
                            processBetDebug("Game with id " + game['gameId'] + " removed from database");
                            callbackGame();
                          });
                        });
                      });
                    });
                  } else {
                    processBetDebug("Game with id " + game['gameId'] + " is still running");
                    callbackGame();
                  }
                });
              });
            });
          }, function(err) {
            processBetDebug("Done processing bets");
            callbackFinal()
          });
        });

      }*/

  }
};
