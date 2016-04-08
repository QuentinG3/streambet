/* jshint moz : true*/
/*
__      __        _       _     _
\ \    / /       (_)     | |   | |
 \ \  / /_ _ _ __ _  __ _| |__ | | ___  ___
  \ \/ / _` | '__| |/ _` | '_ \| |/ _ \/ __|
   \  / (_| | |  | | (_| | |_) | |  __/\__ \
    \/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/
                                           */
const TEAM_RIGHT = 200;
const TEAM_LEFT = 100;

var STREAMER_TEAM = 0;
var NON_STREAMER_TEAM = 0;

var userBetAmount = 0;
var userBetTeam = 0;

var chat_open = false;

//Right Team
var RightBlock = document.getElementById("block-right");
var RightTeam = document.getElementById("team-right");
var RightTeamName = document.getElementById("team-name-right");
var RightPicture = document.getElementsByClassName("picture-right");
var RightMaster = document.getElementsByClassName("mastery-right");
var RightSpell1 = document.getElementsByClassName("spell1-right");
var RightSpell2 = document.getElementsByClassName("spell2-right");
var RightName = document.getElementsByClassName("summonerName-right");
var RightRank = document.getElementsByClassName("rank-right");
var RightChampion = document.getElementsByClassName("champion-right");

var RightBetButton = document.getElementById("button-right");
var RightPotential = document.getElementById("potential-right");
var RightTeamColor = document.getElementById("team-color-right");
var RightGain = document.getElementById("gain-right");
var RightProgress = document.getElementById("progress-right");

//Blue Modal
var BlueBetAmount = document.getElementById("amount-blue");
var BlueSelectedAmount = document.getElementById("select-blue");
var BlueModal = document.getElementById("modal-blue");

var BlueConnection = document.getElementById("bet-connect-blue");
var BlueBody = document.getElementById("bet-body-blue");
var BlueLoading = document.getElementById("bet-loading-blue");
var BlueMessage = document.getElementById("bet-message-blue");
var BlueError = document.getElementById("error-blue");
var BlueMsgError = document.getElementById("error-msg-blue");
var BlueSuccess = document.getElementById("success-blue");


//Left Team
var LeftBlock = document.getElementById("block-left");
var LeftTeam = document.getElementById("team-left");
var LeftTeamName = document.getElementById("team-name-left");
var LeftPicture = document.getElementsByClassName("picture-left");
var LeftMastery = document.getElementsByClassName("mastery-left");
var LeftSpell1 = document.getElementsByClassName("spell1-left");
var LeftSpell2 = document.getElementsByClassName("spell2-left");
var LeftName = document.getElementsByClassName("summonerName-left");
var LeftRank = document.getElementsByClassName("rank-left");
var LeftChampion = document.getElementsByClassName("champion-left");

var LeftBetButton = document.getElementById("button-left");
var LeftPotential = document.getElementById("potential-left");
var LeftTeamColor = document.getElementById("team-color-left");
var LeftGain = document.getElementById("gain-left");
var LeftProgress = document.getElementById("progress-left");

//Red Modal
var RedBetAmount = document.getElementById("amount-red");
var RedSelectedAmount = document.getElementById("select-red");
var RedModal = document.getElementById("modal-red");

var RedConnection = document.getElementById("bet-connect-red");
var RedBody = document.getElementById("bet-body-red");
var RedLoading = document.getElementById("bet-loading-red");
var RedMessage = document.getElementById("bet-message-red");
var RedError = document.getElementById("error-red");
var RedMsgError = document.getElementById("error-msg-red");
var RedSuccess = document.getElementById("success-red");

//Info
var userStreamCoinField = document.getElementById("streamcoin");
var userStreamCoinFieldM = document.getElementById("streamcoin-m");
var looking = document.getElementById("looking");
var bet_info = document.getElementById("bet-info");
var streamer_info = document.getElementById("streamer-info");
var wonAmount = document.getElementById("wonAmount");
var lostAmount = document.getElementById("lostAmount");


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
        alreadyBetView();
    }
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


/*
 ____       _
|  _ \     | |
| |_) | ___| |_
|  _ < / _ \ __|
| |_) |  __/ |_
|____/ \___|\__|
*/

function redModal() {
    if (!isAuthenticated) {
        connectView();
    } else {
        bodyView();
    }
    $("#modal-red").modal({
        backdrop: "static"
    });
}

function blueModal() {
    if (!isAuthenticated) {
        connectView();
    } else {
        bodyView();
    }
    $("#modal-blue").modal({
        backdrop: "static"
    });
}

function betRed() {
    //Emit bet
    var amount = parseInt(RedSelectedAmount.options[RedSelectedAmount.selectedIndex].value);
    socket.emit('placeBet', {
        streamer: channel_name,
        team: NON_STREAMER_TEAM,
        amount: amount
    });

    //Put the view in already bet mode
    userBetTeam = NON_STREAMER_TEAM;
    userBetAmount = amount;
    //alreadyBetView();

    //Modal in loading State
    loadingView();

    //Follow socket.on("betResponse");
}

function betBlue() {
    //Emit bet
    var amount = parseInt(BlueSelectedAmount.options[BlueSelectedAmount.selectedIndex].value);
    socket.emit('placeBet', {
        streamer: channel_name,
        team: STREAMER_TEAM,
        amount: amount
    });

    //Put the view in already bet mode
    userBetTeam = STREAMER_TEAM;
    userBetAmount = amount;
    //alreadyBetView();

    //Modal in loading State
    loadingView();

    //Follow socket.on("betResponse");
}

function updateBetAmount(amountBlue, amountRed) {

    //Total
    BlueBetAmount.innerHTML = amountBlue;
    RedBetAmount.innerHTML = amountRed;
    var bluePercent = 50;
    var redPercent = 50;

    if (amountBlue > 0 || amountRed > 0) {
        bluePercent = (amountBlue / (amountBlue + amountRed)) * 100;
        redPercent = 100 - bluePercent;
    }

    //Progress bar
    RightProgress.style.width = bluePercent + "%";
    LeftProgress.style.width = redPercent + "%";

    //Potential gain
    if (userBetTeam !== 0 && userBetAmount !== 0) {
        if (userBetTeam == TEAM_LEFT) {
            if (amountBlue > 0) {
                RightGain.innerHTML = -userBetAmount;
            } else {
                RightGain.innerHTML = 0;
            }
            LeftGain.innerHTML = Math.ceil((userBetAmount / amountRed) * amountBlue);
        } else {
            if (amountRed > 0) {
                LeftGain.innerHTML = -userBetAmount;
            } else {
                LeftGain.innerHTML = 0;
            }
            RightGain.innerHTML = Math.ceil((userBetAmount / amountBlue) * amountRed);
        }

    }

}


/*
 _____                         _    _           _       _
/ ____|                       | |  | |         | |     | |
| |  __  __ _ _ __ ___   ___  | |  | |_ __   __| | __ _| |_ ___
| | |_ |/ _` | '_ ` _ \ / _ \ | |  | | '_ \ / _` |/ _` | __/ _ \
| |__| | (_| | | | | | |  __/ | |__| | |_) | (_| | (_| | ||  __/
\_____|\__,_|_| |_| |_|\___|  \____/| .__/ \__,_|\__,_|\__\___|
                                   | |
                                   |_|
*/
function updateTimeStamp(data) {
    //Start chrono
    if (data > 0) {
        chronoStart(data);
    } else {
        chronoReset();
    }
}

function updateGame(object) {
    //Start chrono
    updateTimeStamp(object.timestamp);

    //Update current game
    var player = object.players;
    var bannedChamp = object.bannedChampions;

    //Update streamer info
    streamer_info.innerHTML = "- " + object.summonerName + " (" + object.region + ")";

    //Champion index
    var r = 0;
    var b = 0;

    for (var i = 0; i < player.length; i++) {
        //Red team
        if (player[i].teamId == TEAM_LEFT) {
            //Set picture
            LeftPicture[r].src = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + player[i].championName + "_0.jpg";
            //Set name
            LeftName[r].innerHTML = player[i].summonerName;
            LeftName[r].title = player[i].summonerName;
            //Set Summoner link
            LeftName[r].href = "http://www.lolking.net/summoner/" + object.region + "/" + player[i].summonerId;
            //Set Mastery
            if (player[i].finalMasteryId < 0) {
                LeftMastery[r].src = "/static/lolbet/img/no-mastery.png";
            } else {
                LeftMastery[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/mastery/" + player[i].finalMasteryId + ".png";
            }
            //Set spell1 spell2
            LeftSpell1[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/" + player[i].spell1 + ".png";
            LeftSpell2[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/" + player[i].spell2 + ".png";
            //Set rank
            LeftRank[r].src = "/img/rank/" + player[i].rank + ".png";
            r++;
        }

        //Blue team
        if (player[i].teamId == TEAM_RIGHT) {
            //Set picture
            RightPicture[b].src = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + player[i].championName + "_0.jpg";
            //Set name
            RightName[b].innerHTML = player[i].summonerName;
            RightName[b].title = player[i].summonerName;
            //Set Summoner link
            RightName[b].href = "http://www.lolking.net/summoner/" + object.region + "/" + player[i].summonerId;
            //Set Mastery
            if (player[i].finalMasteryId < 0) {
                RightMaster[b].src = "/static/lolbet/img/no-mastery.png";
            } else {
                RightMaster[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/mastery/" + player[i].finalMasteryId + ".png";
            }
            //Set spell1 spell2
            RightSpell1[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/" + player[i].spell1 + ".png";
            RightSpell2[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/" + player[i].spell2 + ".png";
            //Set rank
            RightRank[b].src = "/img/rank/" + player[i].rank + ".png";
            b++;
        }
    }

    //Update Streamer team TODO
    STREAMER_TEAM = object.teamOfSummoner;
    if (STREAMER_TEAM === 100) {
        NON_STREAMER_TEAM = 200;
    } else {
        NON_STREAMER_TEAM = 100;
    }


    //Update View
    if (STREAMER_TEAM == TEAM_LEFT) {
        blueLeft();
    } else {
        blueRight();
    }

}


/*
__      ___
\ \    / (_)
 \ \  / / _  _____      __
  \ \/ / | |/ _ \ \ /\ / /
   \  /  | |  __/\ V  V /
    \/   |_|\___| \_/\_/
*/


function twitchChat(url) {
    newwindow = window.open(url, '', 'height=600,width=400');
    if (window.focus) {
        newwindow.focus();
    }
}

function alreadyBetView() {
    RightBetButton.style.display = 'none';
    LeftBetButton.style.display = 'none';

    RightPotential.style.display = 'inherit';
    LeftPotential.style.display = 'inherit';
}

function notAlreadyBetView() {
    RightBetButton.style.display = 'inherit';
    LeftBetButton.style.display = 'inherit';

    RightPotential.style.display = 'none';
    LeftPotential.style.display = 'none';
}

function bodyView() {
    RedConnection.style.display = "none";
    BlueConnection.style.display = "none";

    RedBody.style.display = "inherit";
    BlueBody.style.display = "inherit";

    RedLoading.style.display = "none";
    BlueLoading.style.display = "none";

    RedMessage.style.display = "none";
    BlueMessage.style.display = "none";
}

function loadingView() {
    RedConnection.style.display = "none";
    BlueConnection.style.display = "none";

    RedBody.style.display = "none";
    BlueBody.style.display = "none";

    RedLoading.style.display = "inherit";
    BlueLoading.style.display = "inherit";

    RedMessage.style.display = "none";
    BlueMessage.style.display = "none";
}

function messageErrorView(message) {
    RedConnection.style.display = "none";
    BlueConnection.style.display = "none";

    RedBody.style.display = "none";
    BlueBody.style.display = "none";

    RedLoading.style.display = "none";
    BlueLoading.style.display = "none";

    RedMessage.style.display = "inherit";
    BlueMessage.style.display = "inherit";

    RedError.style.display = "inherit";
    BlueError.style.display = "inherit";

    RedMsgError.innerHTML = message;
    BlueMsgError.innerHTML = message;

    RedSuccess.style.display = "none";
    BlueSuccess.style.display = "none";
}

function successView() {
    RedConnection.style.display = "none";
    BlueConnection.style.display = "none";

    RedBody.style.display = "none";
    BlueBody.style.display = "none";

    RedLoading.style.display = "none";
    BlueLoading.style.display = "none";

    RedMessage.style.display = "inherit";
    BlueMessage.style.display = "inherit";

    RedError.style.display = "none";
    BlueError.style.display = "none";

    RedSuccess.style.display = "inherit";
    BlueSuccess.style.display = "inherit";
}

function connectView() {
    RedConnection.style.display = "inherit";
    BlueConnection.style.display = "inherit";

    RedBody.style.display = "none";
    BlueBody.style.display = "none";

    RedLoading.style.display = "none";
    BlueLoading.style.display = "none";

    RedMessage.style.display = "none";
    BlueMessage.style.display = "none";
}

function noGameView() {
    //Team invisible
    RightTeam.style.display = "none";
    LeftTeam.style.display = "none";

    //Looking visible
    looking.style.display = "inherit";

    //Bet-info invisible
    bet_info.style.display = "none";

    //Streamer-info invisible
    streamer_info.style.display = "none";
}

function inGameView() {
    //Team visible
    RightTeam.style.display = "inherit";
    LeftTeam.style.display = "inherit";

    //Looking invisible
    looking.style.display = "none";

    //Bet-info visible
    bet_info.style.display = "inherit";

    //Streamer-info visible
    streamer_info.style.display = "inline-block";

}

function blueRight() {
    /* Bet button */
    //Button right
    RightBetButton.className = "btn btn-bet btn-bet-blue center-block";
    RightBetButton.innerHTML = "Go Blue !";
    RightBetButton.onclick = function() {
        blueModal();
    };
    //Button left
    LeftBetButton.className = "btn btn-bet btn-bet-red center-block";
    LeftBetButton.innerHTML = "Go Red !";
    LeftBetButton.onclick = function() {
        redModal();
    };
    //Team color
    RightTeamColor.innerHTML = "Blue";
    LeftTeamColor.innerHTML = "Red";

    /* Progress Bar */
    RightProgress.className = "progress-bar progress-bar-blue";
    LeftProgress.className = "progress-bar progress-bar-red";


    /* Champion List */
    //Panel
    RightTeam.className = "panel panel-blue";
    LeftTeam.className = "panel panel-red";

    //Label
    RightTeamName.innerHTML = "Blue Team";
    LeftTeamName.innerHTML = "Red Team";

    //Champion
    for (var i = 0; i < RightChampion.length; i++) {
        RightChampion[i].className = "champion champion-right champion-blue";
    }
    for (i = 0; i < LeftChampion.length; i++) {
        LeftChampion[i].className = "champion champion-left champion-red";
    }
}

function blueLeft() {
    /* Bet button */
    //Button right
    RightBetButton.className = "btn btn-bet btn-bet-red center-block";
    RightBetButton.innerHTML = "Go Red !";
    RightBetButton.onclick = function() {
        redModal();
    };
    //Button left
    LeftBetButton.className = "btn btn-bet btn-bet-blue center-block";
    LeftBetButton.innerHTML = "Go Blue !";
    LeftBetButton.onclick = function() {
        blueModal();
    };
    //Team color
    RightTeamColor.innerHTML = "Red";
    LeftTeamColor.innerHTML = "Blue";

    /* Progress Bar */
    RightProgress.className = "progress-bar progress-bar-red";
    LeftProgress.className = "progress-bar progress-bar-blue";

    /* Champion list */
    //Panel
    RightTeam.className = "panel panel-red";
    LeftTeam.className = "panel panel-blue";

    //Label
    RightTeamName.innerHTML = "Red Team";
    LeftTeamName.innerHTML = "Blue Team";

    //Champion
    for (var i = 0; i < RightChampion.length; i++) {
        RightChampion[i].className = "champion champion-right champion-red";
    }
    for (i = 0; i < LeftChampion.length; i++) {
        LeftChampion[i].className = "champion champion-left champion-blue";
    }
}
