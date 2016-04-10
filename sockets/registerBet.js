/* jshint moz:true */
var database = require('../database/connection');
//debugs
var debugRegisterBet = require('debug')('debugRegisterBet');

const MILLISTOBET = 300000;
const MAXAMOUNT = 20;
const MINAMOUNT = 5;

var register = function(user, streamer, game, team, amount, socket, io) {
  //Computing the time since the beggining of the game
  var newDate = new Date();
  var nowMillis = newDate.getTime();
  var timeSinceBeginning = nowMillis - game.timestamp;

  if (!(team == 100 || team == 200)) {
    debugRegisterBet("This team does not exist.");
    return socket.emit('betResponse', {
      success: false,
      error: "The id of the winning team does not exist"
    });
  } else {
    if (!(timeSinceBeginning > MILLISTOBET || game.timestamp == "0")) {
      debugRegisterBet("Can't bet after the 5 minuts mark.");
      return socket.emit('betResponse', {
        success: false,
        error: "You can't bet after the 5 minute mark"
      });
    } else {
      debugRegisterBet("Timestamp under 5 minuts");
      //CHECK if user has enought money
      if (user.money < amount) {
        debugRegisterBet("You don't have that much stream coin");
        return socket.emit('betResponse', {
          success: false,
          error: "You don't have enought money to bet"
        });
      } else {
        debugRegisterBet("You  have enought money to bet");
        if (amount < MINAMOUNT || amount > MAXAMOUNT) {
          debugRegisterBet("The amount bet is not valid");
          return socket.emit('betResponse', {
            success: false,
            error: "The amount bet is not valid"
          });
        } else {
          debugRegisterBet("The amount bet is valid");
          console.log("we here byss");
          database.bets.insertBetIfNotAlreadyBet(game.gameid, game.region, team, amount, user.username)
            .then(function() {
              console.log("inserted sucesfully");
              socket.emit('betResponse', {
                success: true,
                error: null
              });

              database.bets.findBetsForGame(game.gameid, game.region)
                .then(function(betList) {

                  var amount100 = 0;
                  var amount200 = 0;
                  console.log("length = " + betList.length);
                  for (var i = 0; i < betList.length; i++) {
                    var oneBet = betList[i];
                    if (oneBet.teamidwin == "100") {
                      amount100 += oneBet.amount;
                    }
                    if (oneBet.teamidwin == "200") {
                      amount200 += oneBet.amount;
                    }
                  }
                  console.log(amount200);
                  console.log(amount100);
                  io.to(streamer.channelname).emit('bet', {
                    amount200: amount200,
                    amount100: amount100
                  });
                })
                .catch(function(errorGettingAllbets) {
                  debugRegisterBet(errorGettingAllbets);
                });

            })
            .catch(function(errorAddingUniqueBet) {
              return socket.emit('betResponse', {
                success: false,
                error: "You can't bet two times on the same game"
              });
            });
        }
      }
    }
  }
};


module.exports = {
  register: register
};
