var twitch = require("twitch.tv");
var LolApi = require('leagueapi');
var Q = require("q");

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
                deferred.reject(getStreamerError);
            });
        return deferred.promise;
    },

    getSummoners: function(summonersName, region) {
        var deferred = Q.defer();

        //Preparing function in promises
        var summonerGetByNamePromise = Q.denodeify(LolApi.Summoner.getByName);


        summonerGetByNamePromise(summonersName, region)
            .then(function(summonersData) {
                if (summonersData[summonersName].summonerLevel !== 30) {
                    deferred.reject(summonersName + " is not level 30 in " + region);
                } else {

                    var getLeagueEntryDataPromise = Q.denodeify(LolApi.getLeagueEntryData);
                    getLeagueEntryDataPromise(summonersData[summonersName].id, region)
                        .then(function(rankResponse) {
                            var result = {
                                id: summonersData[summonersName].id,
                                name: summonersData[summonersName].name,
                                profileIconId: summonersData[summonersName].profileIconId,
                                summonerLevel: summonersData[summonersName].summonerLevel,
                                revisionDate: summonersData[summonersName].revisionDate,
                                tier: rankResponse[summonersData[summonersName].id][0].tier,
                                division: rankResponse[summonersData[summonersName].id][0].entries[0].division,
                                leaguePoints: rankResponse[summonersData[summonersName].id][0].entries[0].leaguePoints,
                                wins: rankResponse[summonersData[summonersName].id][0].entries[0].wins,
                                losses: rankResponse[summonersData[summonersName].id][0].entries[0].losses,
                            };
                            var GetGameApiNoCallBack = Q.denodeify(LolApi.getCurrentGame);
                            GetGameApiNoCallBack(summonersData[summonersName].id, region)
                                .then(function(gameFromApi) {
                                    result.online = true;

                                    deferred.resolve(result);
                                }).catch(function(errorGetingCurrentGame) {
                                    if (errorGetingCurrentGame != "Error: Error getting current game: 404 Not Found") {
                                        deferred.reject("Could not get the current game of " + summonerName);
                                    } else {
                                        result.online = false;
                                        deferred.resolve(result);
                                    }
                                });
                        }).catch(function(error) {
                            deferred.reject("Could not get the rank of " + summonerName);
                        });

                }
            }).catch(function(getStreamerError) {
                deferred.reject(summonersName + " does not exist in " + region);
            });
        return deferred.promise;
    }
};
