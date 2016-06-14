var twitch = require("twitch.tv");
var LolApi = require('leagueapi');
var Q = require("q");

module.exports = {
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

  getSummonersId: function(summonersName,region){
    var deferred = Q.defer();
    var summonerGetByNamePromise = Q.denodeify(LolApi.Summoner.getByName);
  
    summonerGetByNamePromise(summonersName,region)
        .then(function(summonersData) {
          if(summonersData[summonersName].summonerLevel !== 30){
            deferred.reject(new Error("summoners is not level 30"));
          }
          else{
            deferred.resolve(summonersData[summonersName].id);
          }
        }).catch(function(getStreamerError){
          deferred.reject(new Error("summoners does not exist"));
        });
      return deferred.promise;
  }
};
