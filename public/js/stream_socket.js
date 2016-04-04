/*
__      __        _       _     _
\ \    / /       (_)     | |   | |
 \ \  / /_ _ _ __ _  __ _| |__ | | ___  ___
  \ \/ / _` | '__| |/ _` | '_ \| |/ _ \/ __|
   \  / (_| | |  | | (_| | |_) | |  __/\__ \
    \/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/
                                           */
TEAM_BLUE = 200;
TEAM_RED = 100;

var userBetAmount = 0;
var userBetTeam = 0;

//Blue Team
var BlueTeam = document.getElementById("team-blue");
var BluePicture = document.getElementsByClassName("picture-blue");
var BlueMastery = document.getElementsByClassName("mastery-blue");
var BlueSpell1 = document.getElementsByClassName("spell1-blue");
var BlueSpell2 = document.getElementsByClassName("spell2-blue");
var BlueName = document.getElementsByClassName("summonerName-blue");
var BlueRank = document.getElementsByClassName("rank-blue");
var BlueBetAmount = document.getElementById("amount-blue");

var BlueSelectedAmount = document.getElementById("select-blue");
var BlueModal = document.getElementById("modal-blue");
var BlueBetButton = document.getElementById("button-blue");
var BluePotential = document.getElementById("potential-blue");
var BlueGain = document.getElementById("gain-blue");
var BlueProgress = document.getElementById("progress-blue");

//Red Team
var RedTeam = document.getElementById("team-red");
var RedPicture = document.getElementsByClassName("picture-red");
var RedMastery = document.getElementsByClassName("mastery-red");
var RedSpell1 = document.getElementsByClassName("spell1-red");
var RedSpell2 = document.getElementsByClassName("spell2-red");
var RedName = document.getElementsByClassName("summonerName-red");
var RedRank = document.getElementsByClassName("rank-red");
var RedBetAmount = document.getElementById("amount-red");

var RedSelectedAmount = document.getElementById("select-red");
var RedModal = document.getElementById("modal-red");
var RedBetButton = document.getElementById("button-red");
var RedPotential = document.getElementById("potential-red");
var RedGain = document.getElementById("gain-red");
var RedProgress = document.getElementById("progress-red");

//Info
var looking = document.getElementById("looking");
var bet_info = document.getElementById("bet-info");
var streamer_info = document.getElementById("streamer-info");


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
socket.on('game', function (data) {
  //updateBet amount
  userBetTeam = data.betTeam;
  userBetAmount = data.betAmount;
  updateBetAmount(data.game.amount200, data.game.amount100);

  //updateGame
  updateGame(data.game);

  //In game view
  inGameView();
});

//Listening timeStamp change message
socket.on('timeStamp', function(data){
  //update timestamp
  updateTimeStamp(data);
});

//Listening bet change message
socket.on('bet', function(data){
  //updateBet
  updateBetAmount(data.amount200, data.amount100);
});

//Listening when game is finished
socket.on('finishedGame', function(data){
  //Process Bet
  //TODO show new total

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

function alreadyBetView(){
  BlueBetButton.style.display = 'none';
  RedBetButton.style.display = 'none';

  BluePotential.style.display = 'inherit';
  RedPotential.style.display = 'inherit';
}

function notAlreadyBetView(){
  BlueBetButton.style.display = 'inherit';
  RedBetButton.style.display = 'inherit';

  BluePotential.style.display = 'none';
  RedPotential.style.display = 'none';
}

function betRed(){
  //Emit bet
  var amount = parseInt(RedSelectedAmount.options[RedSelectedAmount.selectedIndex].value);
  socket.emit('placeBet', {streamer : channel_name, team: TEAM_RED, amount: amount} );

  //Put the view in already bet mode
  userBetTeam = TEAM_RED;
  userBetAmount = amount;
  alreadyBetView();

  //Dismiss modal
  $('#modal-red').modal('hide');
}

function betBlue(){
  //Emit bet
  var amount = parseInt(BlueSelectedAmount.options[BlueSelectedAmount.selectedIndex].value);
  socket.emit('placeBet', {streamer : channel_name, team: TEAM_BLUE, amount: amount} );

  //Put the view in already bet mode
  userBetTeam = TEAM_BLUE;
  userBetAmount = amount;
  alreadyBetView();

  //Dismiss modal
  $('#modal-blue').modal('hide');
}

function updateBetAmount(amountBlue, amountRed){

  //Total
  BlueBetAmount.innerHTML = amountBlue;
  RedBetAmount.innerHTML = amountRed;
  var bluePercent = 50;
  var redPercent = 50;

  if(amountBlue > 0 || amountRed > 0){
    var bluePercent = (amountBlue/(amountBlue+amountRed))*100;
    var redPercent = 100 - bluePercent;
  }

  //Progress bar
  BlueProgress.style.width = bluePercent + "%";
  RedProgress.style.width = redPercent + "%";

  //Potential gain
  if(userBetTeam != 0 && userBetAmount != 0){
    if(userBetTeam == TEAM_RED){
      if(amountBlue > 0){
        BlueGain.innerHTML = -userBetAmount;
      }else{
        BlueGain.innerHTML = 0;
      }
      RedGain.innerHTML = Math.ceil((userBetAmount/amountRed)*amountBlue);
    }else{
      if(amountRed > 0){
        RedGain.innerHTML = -userBetAmount;
      }else{
        RedGain.innerHTML = 0;
      }
      BlueGain.innerHTML = Math.ceil((userBetAmount/amountBlue)*amountRed);
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
function updateTimeStamp(data){
  //Start chrono
  if(data > 0){
      chronoStart(data);
  }else{
      chronoReset();
  }
}

function noGameView(){
  //Team invisible
  BlueTeam.style.display = "none";
  RedTeam.style.display = "none";

  //Looking visible
  looking.style.display = "inherit";

  //Bet-info invisible
  bet_info.style.display = "none";

  //Streamer-info invisible
  streamer_info.style.display = "none";
}

function inGameView(){
  //Team visible
  BlueTeam.style.display = "inherit";
  RedTeam.style.display = "inherit";

  //Looking invisible
  looking.style.display = "none";

  //Bet-info visible
  bet_info.style.display = "inherit";

  //Streamer-info visible
  streamer_info.style.display = "inline-block";

}

function updateGame(object){
  //Start chrono
  updateTimeStamp(object.timestamp)

  //Update current game
  var player = object.players;
  var bannedChamp = object.bannedChampions;

  //Update streamer info
  streamer_info.innerHTML = "- " + object.summonersName + " (" + object.region+")";

  //Champion index
  var r = 0;
  var b = 0;

  for (var i = 0; i < player.length; i++) {
      //Red team
      if(player[i].teamId == TEAM_RED){
          //Set picture
          RedPicture[r].src = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/"+player[i].championName+"_0.jpg";
          //Set name
          if(parseInt(object.streamerSummonerId) == parseInt(player[i].summonerId)){
              RedName[r].innerHTML = '<i class="fa fa-video-camera" style="color:#6441A5;"></i> : '+player[i].summonerName;

          }else{
              RedName[r].innerHTML = player[i].summonerName;
          }
          //Set Summoner link
          RedName[r].href = "http://www.lolking.net/summoner/"+object.region+"/"+player[i].summonerId;
          //Set Mastery
          if(player[i].finalMasteryId < 0){
              RedMastery[r].src = "/static/lolbet/img/no-mastery.png";
          }else{
              RedMastery[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/mastery/"+player[i].finalMasteryId+".png";
          }
          //Set spell1 spell2
          RedSpell1[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/"+player[i].spell1+".png";
          RedSpell2[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/"+player[i].spell2+".png";
          //Set rank
          RedRank[r].src = "/img/rank/"+player[i].rank+".png"
          r++;
      }

      //Blue team
      if(player[i].teamId == TEAM_BLUE){
          //Set picture
          BluePicture[b].src = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/"+player[i].championName+"_0.jpg";
          //Set name
          if(parseInt(object.streamerSummonerId) == parseInt(player[i].summonerId)){
              BlueName[b].innerHTML = '<i class="fa fa-video-camera" style="color:#6441A5;"></i> : '+player[i].summonerName;
          }else{
              BlueName[b].innerHTML = player[i].summonerName;
          }
          //Set Summoner link
          BlueName[b].href = "http://www.lolking.net/summoner/"+object.region+"/"+player[i].summonerId;
          //Set Mastery
          if(player[i].finalMasteryId < 0){
              BlueMastery[b].src = "/static/lolbet/img/no-mastery.png";
          }else{
              BlueMastery[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/mastery/"+player[i].finalMasteryId+".png";
          }
          //Set spell1 spell2
          BlueSpell1[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/"+player[i].spell1+".png";
          BlueSpell2[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/"+player[i].spell2+".png";
          //Set rank
          BlueRank[b].src = "/img/rank/"+player[i].rank+".png"
          b++;
      }
  };
}
