var Streamer = require('../models/Streamer');
var Game = require('../models/Game');

module.exports = function (io) {
  /* Listen on user connection */
  io.on('connection', function(socket){

    console.log('a user connected');

    socket.on('room connection', function(msg){
      //Connect the socket to the room
      socket.join(msg);

      //Console chat
      //console.log('connect user to the room : '+msg);
      //console.log('user : '+socket.request.user);

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
              console.log(currentGame);
              socket.emit('game', {game: currentGame});
            }else{
              console.log('no current game');
            }

          });
        }

      });
    });

    socket.on('bet', function(msg){
      console.log('');
    });

    /*
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });*/

  });
}

/* Line to emit a message to a given room */
//io.to('room name').emit('msg',{ object: 'msg' });
