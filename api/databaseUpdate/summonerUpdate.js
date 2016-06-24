var LolApi = require('leagueapi');
var Q = require("q");
var database = require('../../database/connection');

//debugs
var UpdateCurrentGameDebug = require('debug')('updateCurrentGame');

updateSummonersNameFromApiBySummonersId = function(summonerId, region, smallLimitAPI, bigLimitAPI) {
    var deferred = Q.defer();
    console.log("QSDGFGFGSZERFGDSZAERFHG")
    smallLimitAPI.removeTokens(1, function(errSmallAPI, remainingRequestsSmall) {
        bigLimitAPI.removeTokens(1, function(errBigAPI, remainingRequestsBig) {
            if (errSmallAPI || errBigAPI) {
                UpdateCurrentGameDebug(errSmallAPI);
                UpdateCurrentGameDebug(errBigAPI);
                return callbackSummonerOfOnlineStreamer();
            }
            var getsummonerById = Q.denodeify(LolApi.Summoner.getByID);
            getsummonerById(summonerId, region)
                .then(function(summonerData) {
                    database.summoners.updateSummonersNameForSummonerId(summonerId, region, summonerData[summonerId].name)
                        .then(function(sucessResult) {
                            deferred.resolve(sucessResult);
                        }).catch(function(error) {
                            deferred.reject(error);
                        });
                }).catch(function(error) {
                    deferred.reject(error);
                });

        });
    });
    return deferred.promise;
};
module.exports = {
    updateSummonersNameFromApiBySummonersId: updateSummonersNameFromApiBySummonersId
};
