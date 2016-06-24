var twitch = require("twitch.tv");
var LolApi = require('leagueapi');
var database = require('../database/connection');
var Q = require("q");

var summonersRouteDebug = require('debug')('summonersRoute');

module.exports = {
  checkSummonerDB: function(id, region, streamer){
    var deferred = Q.defer();

    //Check in pending list
    database.summoners.getPendingSummoner(id, region, streamer)
    .then(function(pending){
      if(pending){
        deferred.reject(pending.summonersname+" was already requested");
      }else{
        //Check in active list
        database.summoners.getSummoner(id, region)
        .then(function(active){
          if(active){
            deferred.reject(active.summonersname+" is already used by "+active.streamer);
          }else{
            deferred.resolve(true);
          }
        })
        .catch(function(error){
          summonersRouteDebug(error);
          deferred.reject("Internal error with the database");
        });
      }
    })
    .catch(function(error){
      summonersRouteDebug(error);
      deferred.reject("Internal error with the database");
    });
    return deferred.promise;
  },

  streamerExist: function(channelName){
    var deferred = Q.defer();
    var twitchPromise = Q.denodeify(twitch);


    twitchPromise("streams/" + channelName)
        .then(function(streamData) {
          if(!streamData){
            deferred.resolve(false);
          }
          else{
            deferred.resolve(true);
          }
        }).catch(function(getStreamerError){
          deferred.reject(new Error(getStreamerError));
        });
      return deferred.promise;
  },

  getSummoners: function(summonersName,region){
    var deferred = Q.defer();
    var summonerGetByNamePromise = Q.denodeify(LolApi.Summoner.getByName);

    summonerGetByNamePromise(summonersName,region)
        .then(function(summonersData) {
          if(summonersData[summonersName].summonerLevel !== 30){
            deferred.reject(summonersName+" is not level 30 in "+region);
          }
          else{
            //Get rank TODO QUENTIN
            deferred.resolve(summonersData[summonersName]);
          }
        }).catch(function(getStreamerError){
          deferred.reject(summonersName+" does not exist in "+region);
        });
      return deferred.promise;
  },
};
