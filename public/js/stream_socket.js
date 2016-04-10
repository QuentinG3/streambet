/*
  _____             _        _
 / ____|           | |      | |
 | (___   ___   ___| | _____| |_
 \___ \ / _ \ / __| |/ / _ \ __|
 ____) | (_) | (__|   <  __/ |_
|_____/ \___/ \___|_|\_\___|\__|

                             */

//The socket
var socket = io();

//Room connection request
socket.emit('room connection', channel_name);

//Listening game message
socket.on('game', function(data) {
    //updateBet amount
    userBetTeam = data.betTeam;
    userBetAmount = data.betAmount;

    if (userBetAmount === 0) {
        notAlreadyBetView();
    } else {
        notAlreadyBetView();
    }
    console.log(data.amount200);
    console.log(data.amount100);
    console.log(userBetTeam);
    console.log(userBetAmount);
    updateBetAmount(data.amount200, data.amount100);

    //updateGame
    updateGame(data.game);

    //In game view
    inGameView();
});

//Listening timeStamp change message
socket.on('timeStamp', function(data) {
    //update timestamp
    updateTimeStamp(data.timeStamp);
});

//Listening bet change message
socket.on('bet', function(data) {
    //updateBet
    console.log(data.amount200);
    console.log(data.amount100);
    updateBetAmount(data.amount200, data.amount100);
});

socket.on('betResponse', function(data) {
    //Bet accepted
    if (data.success) {
        alreadyBetView();
        successView();

    } else {
        messageErrorView(data.error);
    }
});

//Listening when game is finished
socket.on('finishedGame', function(data) {

    var winnerID = parseInt(data.winner);
    var fAmount100 = parseInt(data.amount100);
    var fAmount200 = parseInt(data.amount200);
    var gain = 0;

    if (userBetTeam > 0 && userBetAmount > 0) {
        if (userBetTeam == winnerID) {
            if (userBetTeam == TEAM_LEFT) {
                gain = Math.ceil((userBetAmount / fAmount100) * fAmount200);
            } else {
                gain = Math.ceil((userBetAmount / fAmount200) * fAmount100);
            }
        } else {
            if (userBetTeam == TEAM_LEFT) {
                if (fAmount200 > 0) {
                    gain = -userBetAmount;
                }
            } else {
                if (fAmount100 > 0) {
                    gain = -userBetAmount;
                }
            }
        }

        if (gain > 0) {
            //Update user total above
            userStreamCoin = parseInt(userStreamCoin) + parseInt(gain);
            userStreamCoinField.innerHTML = userStreamCoin;
            userStreamCoinFieldM.innerHTML = userStreamCoin;

            //Win modal
            wonAmount.innerHTML = gain;
            $("#WinModal").modal({
                backdrop: false
            });
        }

        if (gain < 0) {
            //Update user total above
            userStreamCoin = userStreamCoin + gain;
            userStreamCoinField.innerHTML = userStreamCoin;
            userStreamCoinFieldM.innerHTML = userStreamCoin;

            //Lose modal
            lostAmount.innerHTML = gain;
            $("#LoseModal").modal({
                backdrop: false
            });
        }

    }

    //No game view
    noGameView();
});
