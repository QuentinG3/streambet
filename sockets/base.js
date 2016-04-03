var Streamer = require('../models/Streamer');
var Game = require('../models/Game');

module.exports = function (io) {
  /* Listen on user connection */
  io.on('connection', function(socket){

    console.log('a user connected');

    socket.on('room connection', function(msg){
      //Connect the socket to the room
      socket.join(msg);

      //Game lookup
      Streamer.findOne({channelName: msg}, "_id", function(err,currentStreamer){
        if(err){
          console.log(err);
        }else if(currentStreamer){
          //console.log(currentStreamer);
          Game.findOne({streamer: currentStreamer._id}, function(err,currentGame){
            if(err){
              console.log(err);
            }else if(currentGame){
              //TODO also send if user already bet or not
              console.log(currentGame);
              socket.emit('game', {game: currentGame});
            }else{
              console.log('no current game');
            }

          });
        }

      });
    });

    socket.on('placeBet', function(msg){
      //Data
      var team = msg.team;
      var user = socket.request.user;
      var amount = msg.amount;
      var streamer = msg.streamer;

      console.log(user+" bet "+amount+" on team "+team+" on the game of "+streamer);

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
      //io.to(streamer).emit('bet',{ amount200: amount200, amount100: amount100 });
    });
  });
}

/* Line to emit a message to a given room */
//io.to('room name').emit('msg',{ object: 'msg' });
