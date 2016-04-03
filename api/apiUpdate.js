//API's
var twitch = require("twitch.tv");
var LolApi = require('leagueapi');

var async = require("async");

//Models import
var Streamer = require('../models/Streamer')
var Game = require('../models/Game')

var streamerUpdate = require('./databaseUpdate/streamerUpdate')
var gameUpdate = require('./databaseUpdate/gameUpdate')

LolApi.init("0f161ba9-ce84-42ab-b53d-2dbe14dd2f83");



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
  /*
  Function to update the create the new game in which the streamers(summonersName) are. Only one game at a time per streamer.
  (Also used to update timestamp that wasn't set up the first time we check the api)
  */
  updateCurrentGames : function(){
    //Getting the list of all streamer to lookup there summmonersName
    Streamer.find({},function(err,streamersList){

      //Getting the list of champions and spells once for the whole method(static)
      LolApi.Static.getChampionList({dataById:true}, function(err,listChampion){
        LolApi.Static.getSummonerSpellList({dataById:true}, function(err,spellList){

          //Looping trought all the streamer and their summonersName with async method
          async.each(streamersList,function(streamer,callback){
            async.each(streamer['summoners'],function(summonersName,callback){

              //If there is a game for the streamer alreaady we don't check it
              Game.findOne({streamer:streamer['_id']},function(err,oneGame){
                //We update the game only if the streamer doesn't have a game already
                if(oneGame == null){
                  //We request the API
                  LolApi.getCurrentGame(summonersName['summonerId'],summonersName['region'], function(err,res){
                    gameUpdate.createNewGame(err,res,summonersName,streamer,spellList,listChampion);
                  });
                }
                //If the timestamp wasn't set in the API yet we try to update it
                else if(oneGame['timestamp'] == 0){
                  LolApi.getCurrentGame(summonersName['summonerId'],summonersName['region'], function(err,res){
                    gameUpdate.updateTimeStamp(err,res,oneGame);
                  });

                }
              });
            });
          });
        });
      });
    });
  },
  /*Function that check the game currently in the database to see if there are over.
  If there are done give the reward to those who bet on it and take the points from those that lose the bet
  */
  processBet : function(){
    Game.find({},function(err,gameList){
      console.log(gameList)
    });

  }
}
