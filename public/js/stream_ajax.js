//             _               _____      _               
//       /\   (_)             / ____|    | |              
//      /  \   _  __ ___  __ | (___   ___| |_ _   _ _ __  
//     / /\ \ | |/ _` \ \/ /  \___ \ / _ \ __| | | | '_ \ 
//    / ____ \| | (_| |>  <   ____) |  __/ |_| |_| | |_) |
//   /_/    \_\ |\__,_/_/\_\ |_____/ \___|\__|\__,_| .__/ 
//           _/ |                                  | |    
//          |__/                                   |_|    

// using jQuery
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function setUpAjax(){
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}

setUpAjax();



//   __      __        _       _     _           
//   \ \    / /       (_)     | |   | |          
//    \ \  / /_ _ _ __ _  __ _| |__ | | ___  ___ 
//     \ \/ / _` | '__| |/ _` | '_ \| |/ _ \/ __|
//      \  / (_| | |  | | (_| | |_) | |  __/\__ \
//       \/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/
//                                               
//                                               

//Game Time out
var gameTimeOut = 5000;

//Champions list
var ChampionList = document.getElementsByClassName("champion");

//Pictures list
//Blue Team
var BluePicture = document.getElementsByClassName("picture-blue");
var BlueMastery = document.getElementsByClassName("mastery-blue");
var BlueSpell1 = document.getElementsByClassName("spell1-blue");
var BlueSpell2 = document.getElementsByClassName("spell2-blue");
var BlueName = document.getElementsByClassName("summonerName-blue");
var BlueRank = document.getElementsByClassName("rank-blue");
var BlueBet = document.getElementById("bet-blue");
//Red Team
var RedPicture = document.getElementsByClassName("picture-red");
var RedMastery = document.getElementsByClassName("mastery-red");
var RedSpell1 = document.getElementsByClassName("spell1-red");
var RedSpell2 = document.getElementsByClassName("spell2-red");
var RedName = document.getElementsByClassName("summonerName-red");
var RedRank = document.getElementsByClassName("rank-red");
var RedBet = document.getElementById("bet-red");

//Info
var looking = document.getElementById("looking");
var bet_info = document.getElementById("bet-info");
var streamer_info = document.getElementById("streamer-info");

//Bet
var BlueAmount = document.getElementById("select-blue");
var BlueBody = document.getElementById("blue-bet-body");
var BlueLoading = document.getElementById("blue-bet-loading");
var BlueMessage = document.getElementById("blue-bet-message");
var RedAmount = document.getElementById("select-red");
var RedBody = document.getElementById("red-bet-body");
var RedLoading = document.getElementById("red-bet-loading");
var RedMessage = document.getElementById("red-bet-message");

//    ____       _   
//   |  _ \     | |  
//   | |_) | ___| |_ 
//   |  _ < / _ \ __|
//   | |_) |  __/ |_ 
//   |____/ \___|\__|
//                   
//                  

function bet(teamID, amount){
    $.post("/lolbet/ajax_bet",
    {
        streamer: channel_name,
        gameID: game_ID,
        teamIdWin: teamID,
        amount: amount,
    },
    function(data,status){
        alert(data);
    });
}

function betBlue(){
        var amount = BlueAmount.options[BlueAmount.selectedIndex].value;
        bet(200,amount);        
        //Hide bet form and show waiting animation
        BlueBody.style.display = "none";
        BlueLoading.style.display = "inherit";
    }

    function betRed(){
        var amount = RedAmount.options[RedAmount.selectedIndex].value;
        bet(100,amount);
        //Hide bet form and show waiting animation
        RedBody.style.display = "none";
        RedLoading.style.display = "inherit";
    }

//     _____                        _    _           _       _       
//    / ____|                      | |  | |         | |     | |      
//   | |  __  __ _ _ __ ___   ___  | |  | |_ __   __| | __ _| |_ ___ 
//   | | |_ |/ _` | '_ ` _ \ / _ \ | |  | | '_ \ / _` |/ _` | __/ _ \
//   | |__| | (_| | | | | | |  __/ | |__| | |_) | (_| | (_| | ||  __/
//    \_____|\__,_|_| |_| |_|\___|  \____/| .__/ \__,_|\__,_|\__\___|
//                                        | |                        
//                                        |_|                        

function updateGame(){
    $.post("/lolbet/ajax_game",
        {
          streamer: channel_name,
          gameID: game_ID,
        },
        function(data,status){
            if(data){
                var object = JSON.parse(data);

                //Update Time Out
                gameTimeOut = parseInt(object.timeOut);

                if(game_ID == object.gameId){
                    //Same game nothing to do
                    //Synchronise chrono
                    if(object.timestamp > 0){
                        chronoStart(object.timestamp);
                    }else{
                        chronoReset();
                    }
                }else{
                    game_ID = object.gameId;
                    if(game_ID > -1){

                        //Start chrono
                        if(object.timestamp > 0){
                            chronoStart(object.timestamp);
                        }else{
                            chronoReset();
                        }
                        

                        //Update current game
                        var player = object.player;
                        var bannedChamp = object.bannedChampion;

                        //Update streamer info
                        streamer_info.innerHTML = "- " + object.streamerSummonerName + " (" + object.region+")";

                        var r = 0;
                        var b = 0;

                        for (var i = 0; i < player.length; i++) {
                            //Red team
                            if(player[i].teamId == 100){
                                //Set picture
                                RedPicture[r].src = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/"+player[i].championName+"_0.jpg";
                                //Set name
                                if(parseInt(object.streamerSummonerId) == parseInt(player[i].summonerId)){
                                    RedName[r].innerHTML = '<i class="fa fa-video-camera" style="color:#6441A5;"></i> : '+player[i].summonerName;
                                    BlueBet.innerHTML = '<i class="fa fa-thumbs-down fa-2x"></i>';
                                    RedBet.innerHTML = '<i class="fa fa-thumbs-up fa-2x"></i>';

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
                                //TODO
                                RedRank[r].src = "/static/lolbet/img/rank/unranked.png"
                                r++;
                            }

                            //Blue team
                            if(player[i].teamId == 200){
                                //Set picture
                                BluePicture[b].src = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/"+player[i].championName+"_0.jpg";
                                //Set name
                                if(parseInt(object.streamerSummonerId) == parseInt(player[i].summonerId)){
                                    BlueName[b].innerHTML = '<i class="fa fa-video-camera" style="color:#6441A5;"></i> : '+player[i].summonerName;
                                    BlueBet.innerHTML = '<i class="fa fa-thumbs-up fa-2x"></i>';
                                    RedBet.innerHTML = '<i class="fa fa-thumbs-down fa-2x"></i>';
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
                                //TODO
                                BlueRank[b].src = "/static/lolbet/img/rank/unranked.png"
                                b++;
                            }
                        };

                        //Champion visible
                        for (var i = 0; i < ChampionList.length; i++) {
                            ChampionList[i].style.display = "inherit";
                        };

                        //Looking invisible
                        looking.style.display = "none";

                        //Bet-info visible
                        bet_info.style.display = "inherit";

                        //Streamer-info visible
                        streamer_info.style.display = "inline-block";

                    }else{
                        //Suppress current game
                        //Champion invisible
                        for (var i = 0; i < ChampionList.length; i++) {
                            ChampionList[i].style.display = "none";
                        };

                        //Looking visible
                        looking.style.display = "inherit";

                        //Bet-info invisible
                        bet_info.style.display = "none";

                        //Streamer-info invisible
                        streamer_info.style.display = "none";
                    }
                }
                setUpAjax();
                setTimeout("updateGame()", gameTimeOut);
            }else{
                setUpAjax();
                setTimeout("updateGame()", 5000);
            }

            
        });

    
}

updateGame();
