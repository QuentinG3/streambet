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
