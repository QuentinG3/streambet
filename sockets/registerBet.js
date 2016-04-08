/* jshint moz:true */

//debugs
var debugRegisterBet = require('debug')('debugRegisterBet');

const MILLISTOBET = 300000;

var register = function(user, streamer, game, team, amount, socket, io) {
  //Computing the time since the beggining of the game
  var nowMillis = (new Date()).getTime();
  var timeSinceBeginning = nowMillis - game.timestamp;

  if (!(team == 100 || team == 200)) {
    debugRegisterBet("This team does not exist.");
    return socket.emit('betResponse', {
      success: false,
      error: "The id of the winning team does not exist"
    });
  } else {
    if (!(timeSinceBeginning < MILLISTOBET || gameDb.timestamp === 0)) {
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
        return socket.emit('betResponse',{success:false, error:"You don't have enought money to bet"});
      }
      else{
        
      }
    }

  }
};


module.exports = {
  register: register
};
