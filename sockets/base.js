module.exports = function (io) {
  /* Listen on user connection */
  io.on('connection', function(socket){

    console.log('a user connected');

    socket.on('room connection', function(msg){
      socket.join(msg);
      console.log('connect user to the room : '+msg);
      console.log('user : '+socket.request.user);
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
