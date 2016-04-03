var Game = require('../../models/Game')

FINAL_MASTERIES_LIST = [6161,6162,6164,6261,6262,6263,6361,6362,6363];
ALLOWED_QUEUE_TYPE = [4,410];

  var createNewGame = function(err,res,summonersName,streamer,spellList,listChampion){

    //We check that the user is in a game
    if(res != undefined){
      //We check that the user is in a ranked game(dynamic)
      if(ALLOWED_QUEUE_TYPE.indexOf(res['gameQueueConfigId'])!= -1){
        //console.log(listChampion);
        //We get the teamId of the summoner
        newGame = new Game({gameId:res['gameId'],timestamp:res['gameStartTime'],amount100:0,amount200:0,streamer:streamer['_id'],region:summonersName['region'],summonersName:summonersName['name']})
        for(var i=0;i<res['participants'].length;i++){
          var participant = res['participants'][i]
          if(participant['summonerId'] == summonersName['summonerId']){
            newGame.teamId = participant['teamId'];
          }
        }
        //We get the bannedChampions
        var bannedChampionList = [];
        for(var i=0;i<res['bannedChampions'].length;i++){
          var bannedChampion = res['bannedChampions'][i];
            bannedChampionList.push({name:listChampion['data'][bannedChampion['championId']]['key'],teamId:bannedChampion['teamId']});
        }
        newGame.bannedChampions=bannedChampionList;

        //We get the players in the game
        var playerList = [];
        for(var i=0;i<res['participants'].length;i++){
            var participant = res['participants'][i];
            finalMastery = -1;
            //Getting the masteries of the player
            for(var j=0;j<participant['masteries'].length;j++){
              mastery = participant['masteries'][j];
              if (FINAL_MASTERIES_LIST.indexOf(mastery['masteryId']) != -1){
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
  }


  var updateTimeStamp = function(err,res,oneGame){
    Game.findByIdAndUpdate(oneGame['_id'],{$set : {timestamp:res['gameStartTime']}},function(err){
      if(err) return console.error("error when updateing the timestamp",error);
    })
  }

module.exports = {
  createNewGame:createNewGame,
  updateTimeStamp:updateTimeStamp
}
