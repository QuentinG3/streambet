//API's
var twitch = require("twitch.tv");
var LolApi = require('leagueapi');

var async = require("async");

//Models import
var Streamer = require('../models/Streamer')
var Game = require('../models/Game')
var Bet = require('../models/Bet')
var User = require('../models/User')

var streamerUpdate = require('./databaseUpdate/streamerUpdate')
var gameUpdate = require('./databaseUpdate/gameUpdate')

//debugs
var UpdateStreamerDebug = require('debug')('updateStreamer');
var UpdateCurrentGameDebug = require('debug')('updateCurrentGame');
var doubleLoopDebug = require('debug')('doubleLoop');
var processBetDebug = require('debug')('processBet');

//Quentin API
LolApi.init("0f161ba9-ce84-42ab-b53d-2dbe14dd2f83");
//Nicolas API
//LolApi.init("3237f591-a76d-4643-a49e-bc08be9a638b");


module.exports = {
  /*
  Function to update streamers viewers and online in the database by
  requesting the API.
  */
  updateStreamers: function(callbackFinal){
    //We get all the streamers channelName
    Streamer.find({},"channelName",function(err,streamersList){
      //For each streamer we request the twitch API asyncroniously.
      async.each(streamersList,function(streamer,callback){
        //Calling the api
        twitch("streams/"+streamer['channelName'],function(err,streamInfo){
          streamerUpdate.updateStreamer(err,streamInfo,streamer,callback);
          });
        },function(err){
          UpdateStreamerDebug("Done updating streamers");
          callbackFinal(null, "one");
        });
    });

  },
  /*
  Function to update the create the new game in which the streamers(summonersName) are. Only one game at a time per streamer.
  (Also used to update timestamp that wasn't set up the first time we check the api)
  */
  updateCurrentGames : function(callbackFinal,smallLimitAPI,bigLimitAPI,io){
    //Getting the list of all streamer to lookup there summmonersName
    Streamer.find({online:true},function(err,streamersList){
      doubleLoopDebug(streamersList)
      //Getting the list of champions and spells once for the whole method(static)
      LolApi.Static.getChampionList({dataById:true}, function(err,listChampion){
        LolApi.Static.getSummonerSpellList({dataById:true}, function(err,spellList){

          //Looping trought all the streamer and their summonersName with async method
          async.each(streamersList,function(streamer,callbackStreamer){
            async.each(streamer['summoners'],function(summonersName,callbackSummoners){
                doubleLoopDebug(streamer['name'] +" "+ summonersName['name']);
              //If there is a game for the streamer alreaady we don't check it
              Game.findOne({streamer:streamer['_id'],summonersName:summonersName['name']},function(err,oneGame){
                //We update the game only if the streamer doesn't have a game already
                if(oneGame == null){
                  UpdateCurrentGameDebug("No game found in DB for " + streamer['name'] +" "+ summonersName['name']);


                  smallLimitAPI.removeTokens(1, function(err, remainingRequestsSmall) {
                    bigLimitAPI.removeTokens(1, function(err, remainingRequestsBig) {
                      UpdateCurrentGameDebug("Remaining requests " + remainingRequestsSmall);
                      //We request the API
                      LolApi.getCurrentGame(summonersName['summonerId'],summonersName['region'], function(err,currentGame){
                        gameUpdate.createNewGame(err,currentGame,summonersName,streamer,spellList,listChampion,callbackSummoners,io,smallLimitAPI,bigLimitAPI);
                      });
                    });
                });
                }
                //If the timestamp wasn't set in the API yet we try to update it
                else if(oneGame['timestamp'] == 0){
                  UpdateCurrentGameDebug("Updating timestamp for " + streamer['name']);
                  smallLimitAPI.removeTokens(1, function(err, remainingRequestsSmall) {
                    bigLimitAPI.removeTokens(1, function(err, remainingRequestsBig) {
                      LolApi.getCurrentGame(summonersName['summonerId'],summonersName['region'], function(err,res){
                        gameUpdate.updateTimeStamp(err,res,oneGame,callbackSummoners,streamer,summonersName,io);
                      });
                    });
                });
                }
                else{
                  UpdateCurrentGameDebug(streamer['name'] +" "+ summonersName['name']+"already in a game in DB");
                  callbackSummoners();
                }
              });
            },function(err){
              callbackStreamer();
            });
          },function(err){
            UpdateCurrentGameDebug("Done updating current games");
            callbackFinal(null, "two");
          });
        });
      });
    });
  },
  /*Function that check the game currently in the database to see if there are over.
  If there are done give the reward to those who bet on it and take the points from those that lose the bet
  */
  processBet : function(callbackFinal,smallLimitAPI,bigLimitAPI,io){
    Game.find({},function(err,gameList){
        async.each(gameList,function(game,callbackGame){
          smallLimitAPI.removeTokens(1, function(err,remainingRequestsSmall) {
            bigLimitAPI.removeTokens(1, function(err, remainingRequestsBig) {
              LolApi.getMatch(game['gameId'],false,game['region'],function(err,gameApi){
                if(err != "Error: Error getting match: 404 Not Found" && err != null){
                  processBetDebug(err);
                }
                if(gameApi != undefined){
                  var winnerTeamId = -1;
                  for(var i =0;i<gameApi['teams'].length;i++){
                    var team = gameApi['teams'][i];
                    if(team['winner']){
                      winnerTeamId = team['teamId'];
                    }
                  }
                  processBetDebug("Game with game id "+ game['gameId'] + " is done with winner " + winnerTeamId);

                  //Winning team is in var winnerTeamId
                  //HERE PROCESS BETS....
                  Bet.find({game:game['_id']},function(errorBets,allBets){
                    totalAmount100 = 0;
                    totalAmount200 = 0;
                    for(var i=0;i<allBets.length;i++){
                      oneBet = allBets[i];
                      if(oneBet['teamIdWin'] == 100){
                        totalAmount100 += oneBet['amount'];
                      }
                      else if(oneBet['teamIdWin'] == 200){
                        totalAmount200 += oneBet['amount'];
                      }
                    }

                    processBetDebug("TotalAmount100 = " + totalAmount100);
                    processBetDebug("TotalAmount200 = " + totalAmount200);

                    async.each(allBets,function(singleBet,callbackBet){
                      gainAmount = 0;
                      amountBet = singleBet['amount'];
                      processBetDebug("AmountBet = " + amountBet);
                      processBetDebug("teamIdWin = " + singleBet['teamIdWin']);
                      if(winnerTeamId == singleBet['teamIdWin']){
                        if(winnerTeamId == "100"){
                          gainAmount = Math.ceil((amountBet/totalAmount100)*totalAmount200);
                        }
                        else{
                          gainAmount = Math.ceil((amountBet/totalAmount200)*totalAmount100);
                        }
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
                      processBetDebug(gainAmount);
                      User.update({_id:singleBet['user']},{$inc:{elo:gainAmount}},function(errorUpdateEloUser){
                        callbackBet();

                      });

                    },function(errAsyncBet){
                      //Remove bets
                      Bet.remove({game:game['_id']},function(errorBetsRemove){
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
                      });
                    });
                  });
                }
                else{
                processBetDebug("Game with id "+ game['gameId'] + " is still running");
                callbackGame();
              }
              });
            });
          });
        },function(err){
          processBetDebug("Done processing bets");
          callbackFinal()
        });
    });

  }
}
