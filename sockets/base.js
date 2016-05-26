/* jshint moz:true */

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
                                    database.bannedChampions.getBannedChampionForGame(game.gameid, game.region, game.streamer)
                                        .then(function(bannedChampionList) {
                                            database.players.getPlayersForGame(game.gameid, game.region, game.streamer)
                                                .then(function(playerList) {
                                                    database.bets.findBetsForGame(game.gameid, game.region, game.streamer)
                                                        .then(function(betList) {

                                                            amount100 = 0;
                                                            amount200 = 0;
                                                            betTeam = 0;
                                                            betAmount = 0;

                                                            for (var i = 0; i < betList.length; i++) {
                                                                var oneBet = betList[i];
                                                                if (oneBet.teamidwin === "100") {
                                                                    amount100 += oneBet.amount;
                                                                }
                                                                if (oneBet.teamidwin === "200") {
                                                                    amount200 += oneBet.amount;
                                                                }
                                                                if (oneBet.users == username) {
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
                                          console.log(errorGettingGame);
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
        });
    });

};

/* Line to emit a message to a given room */
//io.to('room name').emit('msg',{ object: 'msg' });

module.exports = {
    startSocketIO: startSocketIO
};
