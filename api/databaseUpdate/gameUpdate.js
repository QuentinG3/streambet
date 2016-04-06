var Game = require('../../models/Game')
var LolApi = require('leagueapi');
//debugs
var UpdateCurrentGameDebug = require('debug')('updateCurrentGame');


FINAL_MASTERIES_LIST = [6161,6162,6164,6261,6262,6263,6361,6362,6363];
ALLOWED_QUEUE_TYPE = [4,410];

  var createNewGame = function(err,currentGame,summonersName,streamer,spellList,listChampion,callback,io,smallLimitAPI,bigLimitAPI){

    if (err != "Error:  Error getting current game: 404 Not Found" && err != null){
      UpdateCurrentGameDebug("Error other than 404 game no found happened when requesting api for game for "+ streamer['name'] + " " + summonersName['name'] + err);
    }
    //We check that the user is in a game
    if(currentGame != undefined){
      UpdateCurrentGameDebug("Game found in API for "+ streamer['name'] + " " + summonersName['name']);
      //We check that the user is in a ranked game(dynamic)
      if(ALLOWED_QUEUE_TYPE.indexOf(currentGame['gameQueueConfigId']) != -1){
        //We get the teamId of the summoner
        newGame = new Game({gameId:currentGame['gameId'],bets:[],channelName:streamer['channelName'],timestamp:currentGame['gameStartTime'],streamer:streamer['_id'],region:summonersName['region'],summonersName:summonersName['name']});

        //We get the bannedChampions
        var bannedChampionList = [];
        for(var i=0;i<currentGame['bannedChampions'].length;i++){
          var bannedChampion = currentGame['bannedChampions'][i];
            bannedChampionList.push({name:listChampion['data'][bannedChampion['championId']]['key'],teamId:bannedChampion['teamId']});
        }
        newGame.bannedChampions=bannedChampionList;
        //Getting the summonersId of all the particiants to get their ranks
        var sumIdsString = "";
        for(var i= 0;i<currentGame['participants'].length;i++){
          sumIdToadd = currentGame['participants'][i]['summonerId']
          sumIdsString += sumIdToadd + ","
        }
        smallLimitAPI.removeTokens(1, function(err, remainingRequestsSmall) {
          bigLimitAPI.removeTokens(1, function(err, remainingRequestsBig) {
            LolApi.getLeagueEntryData(sumIdsString, summonersName['region'], function(err,rankings){

              //We get the players in the game
              var playerList = [];
              for(var i=0;i<currentGame['participants'].length;i++){
                  var participant = currentGame['participants'][i];
                  var finalMastery = -1;
                  //Getting the masteries of the player
                  for(var j=0;j<participant['masteries'].length;j++){
                    mastery = participant['masteries'][j];
                    if (FINAL_MASTERIES_LIST.indexOf(mastery['masteryId']) != -1){
                      finalMastery = mastery['masteryId'];
                    }
                  }
                  //Getting the player's rank for RANKED_SOLO_5x5
                  playerRank = "UNRANKED"

                  if(rankings[participant['summonerId']] != undefined){
                    for(var j=0;j<rankings[participant['summonerId']].length;j++)
                    {
                      if(rankings[participant['summonerId']][j]['queue'] == "RANKED_SOLO_5x5"){
                        playerRank = rankings[participant['summonerId']][j]['tier']
                      }
                    }
                  }

                  playerList.push({summonerName:participant['summonerName'],summonerId:participant['summonerId'],teamId:participant['teamId'],
                                    championName:listChampion['data'][participant['championId']]['key'],
                                    spell1:spellList['data'][participant['spell1Id']]['key'],
                                    spell2:spellList['data'][participant['spell2Id']]['key'],
                                    rank:playerRank,
                                    finalMasteryId:finalMastery});
              }
               newGame.players = playerList;

              //We create the game
              newGame.save(function(err){
                if (err) return console.error("Error when creating the game",err);
                io.to(streamer['channelName']).emit('game',{game: newGame, betTeam:0,betAmount:0});
                UpdateCurrentGameDebug("newGame well saved");
                callback();
              });
            });
          });
        });
      }
      else{
        UpdateCurrentGameDebug(streamer['name'] + " " + summonersName['name'] + " not in an allowed queue type");
        callback();
      }
    }
    else{
    UpdateCurrentGameDebug("No game found in API for "+ streamer['name'] + " " + summonersName['name']);
      callback();
    }
  }



  var updateTimeStamp = function(err,currentGame,oneGame,callback,streamer,summonersName,io){
    if(err){
      callback();
      return console.error("Error when updating timestamp of a game (API request error?)",err);
    }
    Game.findByIdAndUpdate(oneGame['_id'],{$set : {timestamp:currentGame['gameStartTime']}},function(err){
      if(err){
        callback();
        return console.error("error when updateing the timestamp",error);
      }
      io.to(streamer['channelName']).emit('timeStamp',{timeStamp: currentGame['gameStartTime']});
      UpdateCurrentGameDebug("Updated timestamp for "+ streamer['name'] + " " + summonersName['name'] + " (might still be 0)");
      callback();
    });
  }

module.exports = {
  createNewGame:createNewGame,
  updateTimeStamp:updateTimeStamp
}
