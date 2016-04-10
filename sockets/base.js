/* jshint moz:true */

var Streamer = require('../models/Streamer');
var User = require('../models/User');
var Game = require('../models/Game');
var Bet = require('../models/Bet');

var database = require('../database/connection');

var registerBet = require('./registerBet');

//debugs
var debugRegisterBet = require('debug')('debugRegisterBet');
var debugRoomConnection = require('debug')('debugRoomConnection');
const MILLISTOBET = 300000;

startSocketIO = function(io) {

  /* Listen on user connection */
  io.on('connection', function(socket) {
    /* Listen on room connection request. */
    socket.on('room connection', function(channelName) {

      //Verify the msg
      //TODO

      //Connect the socket to the room asked
      socket.join(channelName);

      var username = socket.request.user.username;

      database.streamer.getStreamerByChannelName(channelName)
        .then(function(streamer) {
          if (!streamer) {
            return debugRoomConnection("Streamer not found");
          } else {
            database.games.getGameOfStreamerWithSummonerName(streamer.channelname)
              .then(function(game) {
                if (!game) {
                  return debugRoomConnection("Game not found");
                } else {
                  database.bannedChampions.getBannedChampionForGame(game.gameid, game.region)
                    .then(function(bannedChampionList) {
                        database.players.getPlayersForGame(game.gameid, game.region)
                          .then(function(playerList) {
                              database.bets.findBetsForGame(game.gameid, game.region)
                                .then(function(betList) {

                                  amount100 = 0;
                                  amount200 = 0;
                                  betTeam = 0;
                                  betAmount = 0;

                                  for(var i =0;i<betList.length;i++){
                                    var oneBet = betList[i];
                                    if(oneBet.teamidwin === "100"){
                                      amount100 += oneBet.amount;
                                    }
                                    if(oneBet.teamidwin === "200"){
                                      amount200 += oneBet.amount;
                                    }
                                    if(oneBet.users == username){
                                      betTeam = oneBet.teamidwin;
                                      betAmount = oneBet.amount;
                                    }
                                  }

                                  var gameToSend = {
                                    players: playerList,
                                    bannedChampions: bannedChampionList,
                                    region: game.region,
                                    summonerName: game.summonersname,
                                    teamOfSummoner: game.summonerteam,
                                    timestamp: parseInt(game.timestamp)
                                  };
                                  console.log(amount200);
                                  console.log(amount100);
                                  console.log(betTeam);
                                  console.log(betAmount);
                                  socket.emit('game', {
                                    game: gameToSend,
                                    betTeam: betTeam,
                                    betAmount: betAmount,
                                    amount100: amount100,
                                    amount200: amount200
                                  });

                                })
                                .catch(function(errorGettingBets) {
                                  debugRoomConnection(errorGettingPlayer);
                                });

                          })
                          .catch(function(errorGettingPlayer) {
                            debugRoomConnection(errorGettingPlayer);
                          });

                    })
                    .catch(function(errorGettingBannedChampions) {
                      debugRoomConnection(errorGettingBannedChampions);
                    });
                }
              })
              .catch(function(errorGettingGame) {
                debugRoomConnection(errorGettingGame);
              });
          }
        })
        .catch(function(errorGettingStreamer) {
          debugRoomConnection(errorGettingStreamer);
        });

    }); //End of room request listener

    //TODO TRY TO REMOVE THE ELSE WHEN WORKING
    socket.on('placeBet', function(msg) {
      //Data

      //TODO check for undefined

      var team = msg.team;
      var username = socket.request.user.username;
      var amount = parseInt(msg.amount);
      var channelName = msg.streamer;

      console.log("TEAM : "+team);
      database.users.getUserByUsername(username)
        .then(function(user) {
          if (!user) {
            return socket.emit('betResponse', {
              success: false,
              error: "Could not find the user"
            });
          } else {
            debugRegisterBet("User exist");
            database.streamer.getStreamerByChannelName(channelName)
              .then(function(streamer) {
                if (!streamer) {
                  return socket.emit('betResponse', {
                    success: false,
                    error: "Could not find the streamer"
                  });
                } else {
                  debugRegisterBet("Streamer exist");
                  database.games.getGameOfStreamer(streamer.channelname)
                    .then(function(game) {
                      if (!game) {
                        return socket.emit('betResponse', {
                          success: false,
                          error: "This streamer is not in a game"
                        });
                      } else {
                        debugRegisterBet("Game exist");
                        registerBet.register(user, streamer, game, team, amount, socket, io);
                      }
                    })
                    .catch(function(errorGettingGame) {
                      return socket.emit('betResponse', {
                        success: false,
                        error: "Internal server error for game"
                      });
                    });
                }
              })
              .catch(function(errorGetingStreamer) {
                return socket.emit('betResponse', {
                  success: false,
                  error: "Internal server error for streamer"
                });
              });
          }
        })
        .catch(function(errorGettingUser) {
          debugRegisterBet(errorGettingUser);
          return socket.emit('betResponse', {
            success: false,
            error: "Internal server error for user"
          });
        });
      /*

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
                 //}
                // else{
                  // debugRegisterBet("User already bet")
                  // io.to(channelName).emit('bet',{error:"You have already bet", amount200: -1, amount100: -1});
                // }
                 }
               });
             }
           }
         );*/

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

};

/* Line to emit a message to a given room */
//io.to('room name').emit('msg',{ object: 'msg' });

module.exports = {
  startSocketIO: startSocketIO
};
