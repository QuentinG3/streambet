//API's
var twitch = require("twitch.tv");
var LolApi = require('leagueapi');

var async = require("async");

//Models import
var Streamer = require('../models/Streamer')
var Game = require('../models/Game')

var streamerUpdate = require('./databaseUpdate/streamerUpdate')

LolApi.init("0f161ba9-ce84-42ab-b53d-2dbe14dd2f83");
FINAL_MASTERIES_LIST = [6161,6162,6164,6261,6262,6263,6361,6362,6363]

module.exports = {
  /*
  Function to update streamers viewers and online in the database by
  requesting the API.
  */
  updateStreamers: function(){
    //We get all the streamers channelName
    Streamer.find({},"channelName",function(err,streamersList){
      //For each streamer we request the twitch API asyncroniously.
      async.each(streamersList,function(streamer,callback){
        //Calling the api
        twitch("streams/"+streamer['channelName'],function(err,streamInfo){
          streamerUpdate.updateStreamer(err,streamInfo,streamer);
          });
        });
    });

  },
  updateCurrentGames : function(){
    Streamer.find({},function(err,streamersList){
      LolApi.Static.getChampionList({dataById:true}, function(err,listChampion){
      LolApi.Static.getSummonerSpellList({dataById:true}, function(err,spellList){
      async.each(streamersList,function(streamer,callback){
        async.each(streamer['summoners'],function(summonersName,callback){
          Game.count({streamer:streamer['_id']},function(err,count){
            //We update the game only if the streamer doesn't have a game already
            if(count<1){
              //We request the API
              LolApi.getCurrentGame(summonersName['summonerId'],summonersName['region'], function(err,res){
                //We check that the user is in a game
                if(res != undefined){
                  //We check that the user is in a ranked game(dynamic)
                  if(res['gameQueueConfigId'] == 410){
                    //console.log(listChampion);
                    //We get the teamId of the summoner
                    newGame = new Game({gameId:res['gameId'],timestamp:res['gameStartTime'],amount100:0,amount200:0,streamer:streamer['_id']})
                    for(var i=0;i<res['participants'].length;i++){
                      if(res['participants'][i]['summonerId'] == summonersName['summonerId']){
                        newGame.teamId = res['participants'][i]['teamId'];
                      }
                    }
                    //We get the bannedChampions
                    var bannedChampionList = [];
                    for(var i=0;i<res['bannedChampions'].length;i++){
                        bannedChampionList.push({name:listChampion['data'][res['bannedChampions'][i]['championId']]['key'],teamId:res['bannedChampions'][i]['teamId']});
                    }
                    newGame.bannedChampions=bannedChampionList;

                    //We get the players in the game
                    var playerList = [];
                    for(var i=0;i<res['participants'].length;i++){
                        participant = res['participants'][i];
                        finalMastery = -1;
                        //Getting the masteries of the player
                        for(var j=0;j<participant['masteries'].length;j++){
                          mastery = participant['masteries'][j];
                          if (FINAL_MASTERIES_LIST.indexOf(mastery['masteryId'])){
                            finalMastery = mastery['masteryId'];
                          }
                        }
                        playerList.push({summonerName:participant['summonerName'],summonerId:participant['summonerId'],teamId:participant['teamId'],
                                          championName:listChampion['data'][participant['championId']]['key'],
                                          spell1:spellList['data'][participant['spell1Id']]['key'],
                                          spell2:spellList['data'][participant['spell2Id']]['key'],
                                          rank:"Silver",
                                          finalMasteryId:finalMastery});
                    }
                     newGame.players = playerList;

                    //We create the game
                    newGame.save(function(err){
                      if (err) return console.error("Error when creating the game",err);
                      console.log("newGame well saved");
                    });
                  }
                }
              });
            }
          });
        });
      });
      });
      });
    });
  }
}
