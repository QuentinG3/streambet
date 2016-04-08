var Streamer = require('../models/Streamer');
var User = require('../models/User');
var Game = require('../models/Game');
var Bet = require('../models/Bet');

//debugs
var debugRegisterBet = require('debug')('debugRegisterBet');

const MILLISTOBET = 300000;

startSocketIO = function (io) {

  /* Listen on user connection */
  io.on('connection', function(socket){
    /* Listen on room connection request. */
    socket.on('room connection', function(msg){

      //Verify the msg
      //TODO

      //Connect the socket to the room asked
      socket.join(msg);

      var userId = socket.request.user['_id'];

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

              //Emit the current game
              Bet.find({game:currentGame._id,teamIdWin:100},function(errFindBet100,bet100){
                Bet.find({game:currentGame._id,teamIdWin:200},function(errFindBet200,bet200){
                  Bet.findOne({game:currentGame._id,user:userId},function(errFindMyBet,myBet){
                      amount100 = 0;
                      amount200 = 0;
                      betTeam = 0
                      betAmount = 0
                    if (myBet != null){
                      betTeam = myBet['teamIdWin'];
                      betAmount = myBet['amount'];

                    }

                    for(var i=0;i<bet100.length;i++){
                      amount100 += bet100[i]['amount']
                    }
                    for(var i=0;i<bet200.length;i++){
                      amount200 += bet200[i]['amount']
                    }
                    socket.emit('game', {game: currentGame, betTeam: betTeam, betAmount: betAmount,amount100:amount100,amount200:amount200});
                  });
                });
              });

            }
          });
        }
      });//End of lookup

    });//End of room request listener


    socket.on('placeBet', function(msg){
      //Data

      //TODO check for undefined

      var team = msg.team;
      var userId = socket.request.user['_id'];
      var amount = parseInt(msg.amount);
      var channelName = msg.streamer;



      User.findOne({_id: userId},function(errUser,userDb){
        if (errUser) return socket.emit('betResponse',{success: false, error:"Internal server error for user"});
          else if (!userDb){
             return socket.emit('betResponse',{success:false,error:"Could not find the user"});
          }
          else{
           debugRegisterBet("User exists");
           Streamer.findOne({channelName: channelName},function(errStreamer,streamerDb){
             if (errStreamer) return socket.emit('betResponse',{success:false,error:"Internal server error for streamer"});
             else if (!streamerDb){
               return socket.emit('betResponse',{success:false,error:"Could not find the streamer"});
             }
             else{
               debugRegisterBet("Streamer exist");
               Game.findOne({streamer:streamerDb._id},function(errGame,gameDb){
                 if (errGame) return socket.emit('betResponse',{success:false,error:"Internal server error for game"});
                 else if (!gameDb){
                   return socket.emit('betResponse',{success:false,error:"This streamer has no game"});
                 }
                 else{
                   debugRegisterBet("Game exist");
                     var nowMillis = (new Date).getTime();
                     var timeSinceBeginning = nowMillis - gameDb.timestamp;
                     //CHECK timestamp
                     if(team == 100 || team == 200){
                       //TODO CHANGE TIMESTAMP
                       if(timeSinceBeginning < MILLISTOBET || gameDb.timestamp == 0){
                         debugRegisterBet("Timestamp under 5 minuts");
                        //CHECK if user has enought money
                        if(userDb.elo >= amount){
                          debugRegisterBet("User has enought money to bet");
                          //add the bet
                          var newBet = new Bet({teamIdWin:team,amount:amount,user:userDb._id,game:gameDb._id});

                          Bet.findOneAndUpdate({game:gameDb._id,user:userDb._id},{$setOnInsert:{teamIdWin:team,amount:amount,user:userDb._id,game:gameDb._id}},{upsert:true,new:true},function(errSaveBet,result){
                            if (errSaveBet) return socket.emit('betResponse',{success:false,error:"Error while saving bet"});
                            debugRegisterBet("Bet well saved");
                            amount100 = 0
                            amount200 = 0
                            Bet.find({game:gameDb._id,teamIdWin:100},function(errFindBet100,bet100){
                              Bet.find({game:gameDb._id,teamIdWin:200},function(errFindBet200,bet200){
                                for(var i=0;i<bet100.length;i++){
                                  amount100 += bet100[i]['amount']
                                }
                                for(var i=0;i<bet200.length;i++){
                                  amount200 += bet200[i]['amount']
                                }
                                console.log(amount200);
                                console.log(amount100);
                                socket.emit('betResponse',{success:true,error:null});
                                io.to(channelName).emit('bet',{amount200: amount200, amount100: amount100});
                            });
                          });
                        });
                      }
                        else{
                          debugRegisterBet("You don't have that much stream coin");
                          socket.emit('betResponse',{success:false, error:"You don't have enought money to bet"});
                        }
                      }
                      else{
                        debugRegisterBet("Can't bet after the 5 minuts mark.");
                        socket.emit('betResponse',{success:false, error:"You can't bet after the 5 minute mark"});
                      }
                   }
                   else{
                     debugRegisterBet("This team does not exist.");
                     socket.emit('betResponse',{success:false, error:"The id of the winning team does not exist"});
                   }
                 /*}
                 else{
                   debugRegisterBet("User already bet")
                   io.to(channelName).emit('bet',{error:"You have already bet", amount200: -1, amount100: -1});
                 }*/
                 }
               });
             }
           });
          }

      });
      /*TODO :
      Check is user is a real user,
      Check if streamer has a game
      Check if he already bet
      Check if he has enough to bet
      Check timestamp

      State that the user has bet
      Change the game bet amount
      emit on the room streamer the new bet amount
      */

    });
  });

}

/* Line to emit a message to a given room */
//io.to('room name').emit('msg',{ object: 'msg' });

module.exports = {
  startSocketIO : startSocketIO
}
