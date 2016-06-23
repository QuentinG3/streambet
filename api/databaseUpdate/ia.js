/* jshint moz:true */

var database = require('../../database/connection');

var betGenerationDebug = require('debug')('betGeneration');

const MIN_USER_BET_PER_GAME = 40;
const MAX_USER_BET_PER_GAME = 80;
const POSSIBLE_BET_AMOUNT = [5, 10, 15, 20];
const POSSIBLE_TEAM_ID = ["100", "200"];
const LIMITE_TIME_TO_BET = 240000;
const AUTOMATE_USER_PASSWORD = "jhhazlBoiazjehb3wgPSnzCnQeoD.JOwIZ56wrQ5AImi5z1F2dgGGIMeAF1W";
const MILLISTOBET = 300000;


// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBet(gameId, region, channelName, teamIdWin, amount, users, timeBeforeBet, io,timeStamp) {
    setTimeout(function() {
      var newDate = new Date();
      var nowMillis = newDate.getTime();
      var timeSinceBeginning = nowMillis - timeStamp;

        //If the gamestime is before 5 minutes we start the betting IA
        if (timeSinceBeginning < MILLISTOBET || timeStamp === 0){
        addBetInDatabaseAndSendIo(gameId, region, channelName, teamIdWin, amount, users, io);
      }
    }, timeBeforeBet);
}

function addBetInDatabaseAndSendIo(gameId, region, channelName, teamIdWin, amount, users, io) {
    database.bets.insertBetIfNotAlreadyBet(gameId, region, channelName, teamIdWin, amount, users)
        .then(function() {
            betGenerationDebug("Sucessfully added bet for user : " + users);

            database.bets.sumAmountByTeamId(gameId, region, channelName)
                .then(function(sums) {
                    betGenerationDebug("Sending bet to io for user " + users);
                    io.to(channelName).emit('bet', {
                        amount200: parseInt(sums.sum200),
                        amount100: parseInt(sums.sum100)
                    });

                })
                .catch(function(errorGettingSumAmountBets) {
                    betGenerationDebug(errorGettingSumAmountBets);
                });


        })
        .catch(function(errorCreatingBetForAutomateUser) {
            betGenerationDebug(errorCreatingBetForAutomateUser);
        });
}




module.exports = {
    placeBetForRandomUsers: function(gameId, region, channelName, io,timeStamp, callbackSummonerOfOnlineStreamer) {
        //Generating the number of bets for the game
        numberOfBetForGame = getRandomIntInclusive(MIN_USER_BET_PER_GAME, MAX_USER_BET_PER_GAME);
        listOfBetsToSend = [];

        database.users.getAutomateUsers(AUTOMATE_USER_PASSWORD).then(function(automateUserList) {


                while (numberOfBetForGame > 0) {
                    //Getting the user that will bet
                    numberOfAutomateUsers = automateUserList.length;
                    indexOfUser = getRandomIntInclusive(0, numberOfAutomateUsers - 1);
                    randomUser = automateUserList[indexOfUser];
                    automateUserList.splice(indexOfUser, 1);

                    //Getting the amount he will bet
                    indexOfAmountToBet = getRandomIntInclusive(0, POSSIBLE_BET_AMOUNT.length - 1);
                    amountToBet = POSSIBLE_BET_AMOUNT[indexOfAmountToBet];

                    //Getting the team the streamer will bet on
                    indexOfTeamId = getRandomIntInclusive(0, POSSIBLE_TEAM_ID.length - 1);
                    teamToBetOn = POSSIBLE_TEAM_ID[indexOfTeamId];

                    //Getting the time before betting
                    timeBeforeBet = getRandomIntInclusive(0, LIMITE_TIME_TO_BET);



                    createBet(gameId, region, channelName, teamToBetOn, amountToBet, randomUser.username, timeBeforeBet, io,timeStamp);



                    numberOfBetForGame--;
                }
            })
            .catch(function(errorGettingAutomateUsers) {
                betGeneration(errorGettingAutomateUsers);
            });



    }
};
