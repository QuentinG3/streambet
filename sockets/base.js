var Streamer = require('../models/Streamer');
var Game = require('../models/Game');

var tot100 = 0;
var tot200 = 0;



startSocketIO = function (io) {

  /* Listen on user connection */
  io.on('connection', function(socket){

    /* Listen on room connection request. */
    socket.on('room connection', function(msg){

      //Verify the msg
      //TODO

      //Connect the socket to the room asked
      socket.join(msg);

      /* Lookup if there is a game for the channel. */
      //Get the streamer
      Streamer.findOne({channelName: msg}, "_id", function(err,currentStreamer){
        if(err){
          console.log(err);
        }else if(currentStreamer){
          //Get the game
          Game.findOne({streamer: currentStreamer._id}, function(err,currentGame){
            if(err){
              console.log(err);
            }else if(currentGame){
              //TODO also send if user already bet or not
              //Emit the current game
              socket.emit('game', {game: currentGame, betTeam: 0, betAmount: 0});
            }
          });
        }
      });//End of lookup

    });//End of room request listener


    socket.on('placeBet', function(msg){
      //Data
      var team = parseInt(msg.team);
      var user = socket.request.user;
      var amount = parseInt(msg.amount);
      var streamer = msg.streamer;

      /*TODO :
      Check is user is a real user,
      Check if one of is room is the streamer room
      Check if he already bet
      Check if he has enough to bet
      Check if he can bet that much

      State that the user has bet
      Change the game bet amount
      emit on the room streamer the new bet amount
      */

      var amount200 = 0;
      var amount100 = 0;

      if(team == 100){
        //TODO remove this test line
        tot100 = tot100 + amount;
        amount100 = tot100;
        amount200 = tot200;
      }else{
        //TODO remove this test line
        tot200 = tot200 + amount;
        amount200 = tot200;
        amount100 = tot100;
      }

      //Update new amount to the room
      io.to(streamer).emit('bet',{ amount200: amount200, amount100: amount100});
    });
  });

}

/* Line to emit a message to a given room */
//io.to('room name').emit('msg',{ object: 'msg' });

module.exports = {
  startSocketIO : startSocketIO
}
