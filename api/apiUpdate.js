//API's
var twitch = require("twitch.tv");
var LolApi = require('leagueapi');

var async = require("async");
var asyncq = require("async-q");
var Q = require("q");

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

    var championListNoCallback = Q.denodeify(LolApi.Static.getChampionList);
    var championListPromise = championListNoCallback({
      dataById: true
    });

    var spellListNoCallback = Q.denodeify(LolApi.Static.getSummonerSpellList);
    var spellListPromise = spellListNoCallback({
      dataById: true
    });

    var GetGameApiNoCallBack = Q.denodeify(LolApi.getCurrentGame);


    database.summoners.getSummonerOfOnlineStreamers().then(function(summonersOfOnlineStreamersList) {
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

          //If the users isn't in a game we keep going to look if he's in a now game in the API
          if (!gameOfTheStreamer) {

            UpdateCurrentGameDebug("No game found in DB for " + summonerOfOnlineStreamer.summonersname);

            //We check the api call left with the limiters
            smallLimitAPI.removeTokens(1, function(errSmallAPI, remainingRequestsSmall) {
              bigLimitAPI.removeTokens(1, function(errBigAPI, remainingRequestsBig) {
                if (errSmallAPI || errBigAPI) {
                  UpdateCurrentGameDebug(errSmallAPI);
                  UpdateCurrentGameDebug(errBigAPI);
                  return callbackSummonerOfOnlineStreamer();
                }

                //We get the game from the API
                GetGameApiNoCallBack(summonerOfOnlineStreamer.summonerid, summonerOfOnlineStreamer.region)
                  .then(function(gameFromApi) {

                    UpdateCurrentGameDebug("Game found in API for " + summonerOfOnlineStreamer.summonersname);

                    //We create a new game with the informations gotten from the api
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
            //If the user is in the game but the timestamp isn't set yet we try to get in from the api
          } else if (gameOfTheStreamer.timestamp === "0") {
            //We check the api call left with the limiters
            smallLimitAPI.removeTokens(1, function(errSmallAPI, remainingRequestsSmall) {
              bigLimitAPI.removeTokens(1, function(errBigAPI, remainingRequestsBig) {
                if (errSmallAPI || errBigAPI) {
                  UpdateCurrentGameDebug(errSmallAPI);
                  UpdateCurrentGameDebug(errBigAPI);
                  return callbackSummonerOfOnlineStreamer();
                }

                //We get the game from the api to get the timestamp
                GetGameApiNoCallBack(summonerOfOnlineStreamer.summonerid, summonerOfOnlineStreamer.region)
                  .then(function(gameFromApi) {

                    //If the timestamp is set we update it
                    if (gameFromApi.gameStartTime !== 0) {
                      UpdateCurrentGameDebug("Updating timestamp for " + summonerOfOnlineStreamer.channelname);
                      gameUpdate.updateTimeStamp(gameOfTheStreamer, gameFromApi.gameStartTime,summonerOfOnlineStreamer.channelname,io, callbackSummonerOfOnlineStreamer);
                    }
                    //If it isn't set yet we just go to the next summoners to update
                    else {
                      UpdateCurrentGameDebug("TimeStamp still not available in API for " + summonerOfOnlineStreamer.channelname);
                      callbackSummonerOfOnlineStreamer();
                    }
                  })
                  .catch(function(errorGettingGameFromApi) {
                    UpdateCurrentGameDebug(errorGettingGameFromApi);
                    UpdateCurrentGameDebug("Previous error might be because of a server stop... wait for the game to be processed");
                    callbackSummonerOfOnlineStreamer();
                  });
              });
            });
          } else {
            UpdateCurrentGameDebug(summonerOfOnlineStreamer.summonersname + " already in a game in DB");
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
  processBet: function(callbackFinal, smallLimitAPI, bigLimitAPI, io) {
    //We get all the current games in the database
    database.games.getAllGames()
      .then(function(allCurrentGames) {
        var asyncEachPromise = Q.denodeify(async.each);
        asyncEachPromise(allCurrentGames, getResultsOfMatchs)
        .then(function(){
          processBetDebug("All bets processed");
          callbackFinal();
        }).
        catch(function(asyncEachError){
          processBetDebug(asyncEachError);
          callbackFinal();
        });

      })
      .catch(function(errorGettingCurrentGames) {
        processBetDebug(errorGettingCurrentGames);
        callbackFinal();
      });

      //Function of the asycn each call abvoe for each item
      var getResultsOfMatchs = function(currentGame,callBackResultOfMatch){
        //We check the api call left with the limiters
        smallLimitAPI.removeTokens(1, function(errSmallAPI, remainingRequestsSmall) {
          bigLimitAPI.removeTokens(1, function(errBigAPI, remainingRequestsBig) {
            if (errSmallAPI || errBigAPI) {
              processBetDebug(errSmallAPI);
              processBetDebug(errBigAPI);
              return callBackResultOfMatch();
            }

            //We try to get the result of the match
            var getMatchResultNoCallback = Q.denodeify(LolApi.getMatch);
            getMatchResultNoCallback(currentGame.gameid,false,currentGame.region)
            .then(function(gameApi){

              //Getting the id of the winning team
              var winnerTeamId = -1;
              for (var i = 0; i < gameApi.teams.length; i++) {
                var team = gameApi.teams[i];
                if (team.winner) {
                  winnerTeamId = team.teamId;
                }
              }

              //GET ALL THE BEST AND PROCESS BLABLA


              console.log(currentGame.gameid)
              console.log(currentGame.region)
              database.transactions.deleteGameAndProcessBets(currentGame.gameid,currentGame.region)
              .then(function(){
                processBetDebug("Game fully deleted and bet process for game of " + currentGame.streamer);
                callBackResultOfMatch();

              })
              .catch(function(errorTransctionDeleteGameAndProcessBets){
                processBetDebug(errorTransctionDeleteGameAndProcessBets);
                callBackResultOfMatch();
              });



            })
            .catch(function(errorGettingResult){
              if (errorGettingResult != "Error: Error getting match: 404 Not Found") {
                processBetDebug("Error other than game not found : " + errorGettingResult);

                callBackResultOfMatch();
              } else {
                processBetDebug(currentGame.streamer + " 's game is not finished yet'");

                callBackResultOfMatch();
              }
            });

          });//END BIG API
        });//END SMALL API
      };
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
