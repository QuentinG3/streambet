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
