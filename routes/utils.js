var twitch = require("twitch.tv");
var LolApi = require('../api/riotApi').getRiotApi();
var database = require('../database/connection');
var Q = require("q");
var summonersRouteDebug = require('debug')('summonersRoute');

function getCurrentGameAndCurrentChampion(summonersData, region, summonersName) {
    var deferred = Q.defer();

    //We check if the summoner is current ingame
    var GetGameApiNoCallBack = Q.denodeify(LolApi.getCurrentGame);

    GetGameApiNoCallBack(summonersData[summonersName].id, region)
        .then(function(gameFromApi) {

            result = {};
            result.ingame = true;

            //Getting champions name from the static api

            var championListNoCallback = Q.denodeify(LolApi.Static.getChampionList);
            var championListPromise = championListNoCallback({
                dataById: true
            });

            //We get the champion list by id from the static api
            championListPromise.then(function(championList) {
                //We look for the champion of the summoner
                for (var i = 0; i < gameFromApi.participants.length; i++) {
                    currentParticipant = gameFromApi.participants[i];

                    if (currentParticipant.summonerId == summonersData[summonersName].id) {

                        result.champion = championList.data[currentParticipant.championId].key;

                    }

                }
                //Returning the final result
                deferred.resolve(result);
            }).catch(function(errorChampionList) {

                result.champion = 'Unknown';
                deferred.resolve(result);
            });


        }).catch(function(errorGettingCurrentGame) {

            //IF the error is smth else than just not finding the game
            if (errorGettingCurrentGame != "Error: Error getting current game: 404 Not Found") {

                deferred.reject("Could not get the current game of " + summonersName);
            } else {

                result.ingame = false;
                result.champion = 'Unknown';

                deferred.resolve(result);
            }
        });

    return deferred.promise;
}

module.exports = {
    streamerExist: function(channelName) {
        var deferred = Q.defer();
        var twitchPromise = Q.denodeify(twitch);


        twitchPromise("streams/" + channelName)
            .then(function(streamData) {
                if (!streamData) {
                    deferred.resolve(false);
                } else {
                    deferred.resolve(true);
                }
            }).catch(function(getStreamerError) {
                deferred.reject(new Error(getStreamerError));
            });
        return deferred.promise;
    },

    getSummoners: function(summonersName, region) {
        var deferred = Q.defer();

        //Preparing function in promises
        var summonerGetByNamePromise = Q.denodeify(LolApi.Summoner.getByName);

        //We look for the summoner id by summonerName in the api
        summonerGetByNamePromise(summonersName, region)
            .then(function(summonersData) {
                //If the summoner is not level 30 we returned a rejected deffered
                if (summonersData[summonersName].summonerLevel !== 30) {
                    deferred.reject(summonersName + " is not level 30 in " + region);
                } else {
                    //We get the information on the league of the summoner
                    var getLeagueEntryDataPromise = Q.denodeify(LolApi.getLeagueEntryData);
                    //We create the results we want to return with the informations
                    var result = {
                        id: summonersData[summonersName].id,
                        name: summonersData[summonersName].name,
                        profileIconId: summonersData[summonersName].profileIconId,
                        summonerLevel: summonersData[summonersName].summonerLevel,
                        revisionDate: summonersData[summonersName].revisionDate,
                    };

                    getLeagueEntryDataPromise(summonersData[summonersName].id, region)
                        .then(function(rankResponse) {
                            //adding the league information to the result
                            result.tier = rankResponse[summonersData[summonersName].id][0].tier;
                            result.division = rankResponse[summonersData[summonersName].id][0].entries[0].division;
                            result.leaguePoints = rankResponse[summonersData[summonersName].id][0].entries[0].leaguePoints;
                            result.wins = rankResponse[summonersData[summonersName].id][0].entries[0].wins;
                            result.losses = rankResponse[summonersData[summonersName].id][0].entries[0].losses;

                            //We check if the summoner is current ingame
                            getCurrentGameAndCurrentChampion(summonersData, region,summonersName)
                            .then(function(gameResult){
                              result.ingame = gameResult.ingame;
                              result.champion = gameResult.champion;

                              deferred.resolve(result);
                            })
                            .catch(function(gameError){
                              deferred.reject(gameError);
                            });

                        }).catch(function(error) {
                            //Since we couldn't get the result we return the approriate unknown values
                            result.tier = "Unknown";
                            result.division = "";
                            result.leaguePoints = "?";
                            result.wins = "?";
                            result.losses = "?";

                            //We check if the summoner is current ingame
                            getCurrentGameAndCurrentChampion(summonersData, region ,summonersName)
                            .then(function(gameResult){
                              result.ingame = gameResult.ingame;
                              result.champion = gameResult.champion;

                              deferred.resolve(result);
                            })
                            .catch(function(gameError){
                              deferred.reject(gameError);
                            });


                        });


                }
            }).catch(function(getStreamerError) {
                deferred.reject(summonersName + " does not exist in " + region);
            });

        return deferred.promise;
    },

    checkSummonerDB: function(id, region, streamer) {
        var deferred = Q.defer();

        //Check in pending list
        database.summoners.getPendingSummoner(id, region, streamer)
            .then(function(pending) {
                if (pending) {
                    deferred.reject(pending.summonersname + " was already requested");
                } else {
                    //Check in active list
                    database.summoners.getSummoner(id, region)
                        .then(function(active) {
                            if (active) {
                                deferred.reject(active.summonersname + " is already used by " + active.streamer);
                            } else {
                                deferred.resolve(true);
                            }
                        })
                        .catch(function(error) {
                            summonersRouteDebug(error);
                            deferred.reject("Internal error with the database");
                        });
                }
            })
            .catch(function(error) {
                summonersRouteDebug(error);
                deferred.reject("Internal error with the database");
            });
        return deferred.promise;
    }

};
