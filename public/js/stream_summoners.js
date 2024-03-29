//Elements
var tableView = document.getElementById("summonerRequest");
var summonerTable = document.getElementById("summonerTable");
var errorBox = document.getElementById("errorBox");
var errorMessage = document.getElementById("errorMessage");

var confirmView = document.getElementById("addSummoner");
var summonerIcon = document.getElementById("summonerIcon");
var summonerID = document.getElementById("summonerID");
var summonerName = document.getElementById("summonerName");
var summonerNameValue = document.getElementById("summonerNameValue");
var summonerRegion = document.getElementById("summonerRegion");
var summonerRegionValue = document.getElementById("summonerRegionValue");
var summonerRank = document.getElementById("summonerRank");
var summonerLP = document.getElementById("summonerLP");
var summonerIG = document.getElementById("summonerIG");

//Listener on add summoner form
$(document).ready(function() {
  $("#addSummonerForm").validator().on('submit', function(e){
    if(e.isDefaultPrevented()){
      //do nothing
    }else{
      var data = $(this).serializeArray();
      var formURL = $(this).attr("action");
      $.post(formURL,data,function(data, status){
        if(data.success){
          //Confirm summoner
          confirmSummoner(data.summoner);
          //Hide error
          hideError();
        }else{
          //Show an error message
          showError(data.error);
        }
      });
      e.preventDefault();	//STOP default action
    }
  });
});

//Listener on confirm summoner form
$(document).ready(function() {
  $("#confirmSummonerForm").validator().on('submit', function(e){
    if(e.isDefaultPrevented()){
      //do nothing
    }else{
      var data = $(this).serializeArray();
      var formURL = $(this).attr("action");
      $.post(formURL,data,function(data, status){
        if(data.success){
          //Confirm summoner
          reloadSummonerList(data.summonerList);
          //clear summonder name field
          document.getElementById("inputSummonerName").value = "";
          //Show summoner list
          initialView();
          //Hide error
          hideError();
        }else{
          //Show an error message
          showError(data.error);
        }
      });
      e.preventDefault();	//STOP default action
    }
  });
});

//Vote summoner
function voteSummoner(ID, region, streamer, vote){
  //data
  data = {
    ID: ID,
    region: region,
    streamer: streamer,
    vote: vote
  };
  //Request ajax
  $.post("/stream/"+channel_name+"/vote-summoner",data,function(data, status){
    if(data.success){
      //Update score of summoner and buttons

    }else{
      //Error message ? do nothing ?
    }
  });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

//Confirm view
function confirmSummoner(summoner){
  //Change view
  tableView.style.display = "none";
  confirmView.style.display = "inherit";

  //Summoner info
  summonerIcon.src="http://ddragon.leagueoflegends.com/cdn/6.12.1/img/profileicon/" + summoner.profileIconId + ".png";
  summonerID.innerHTML = summoner.id;
  summonerName.innerHTML = summoner.name;
  summonerNameValue.value = summoner.name;
  summonerRegion.innerHTML = summoner.region;
  summonerRegionValue.value = summoner.region;
  summonerRank.innerHTML = capitalizeFirstLetter(summoner.tier) + " " + summoner.division;
  summonerLP.innerHTML = summoner.leaguePoints;

  if(summoner.ingame){
    summonerIG.innerHTML = summoner.name + " is currently in game with " + summoner.champion+".";
    summonerIG.style.color = "green";
  }else{
    summonerIG.innerHTML = summoner.name + " is not currently in game.";
    summonerIG.style.color = "red";
  }


}

//InitialView
function initialView(){
  tableView.style.display = "inherit";
  confirmView.style.display = "none";
}

//Show new list
function reloadSummonerList(summonerList){

  //Flush table
  $("#summonerTable tr").remove();

  //Insert new summoners
  for (i = 0; i < summonerList.length; i++) {
    //summoner
    var summoner = summonerList[i];

    //New row
    var row = summonerTable.insertRow(i);

    row.className = "tr-with-button";

    //New cells
    var id = row.insertCell(0);
    var name = row.insertCell(1);
    var region = row.insertCell(2);
    var score = row.insertCell(3);
    var upvote = row.insertCell(4);
    var downvote = row.insertCell(5);

    //Info
    id.innerHTML = summoner.summonerid;
    name.innerHTML = summoner.summonersname;
    region.innerHTML = summoner.region;
    region.className = "text-center";
    score.innerHTML = summoner.score;
    score.className = "text-center";
    upvote.innerHTML = '<button type="button" class="btn btn-success btn-vote" name="button" onclick="voteSummoner('+"'"+summoner.summonerid+"', '"+summoner.region+"', '"+channel_name+"', "+1+')"><i class="fa fa-arrow-up"></button>';
    upvote.className = "text-center";
    downvote.innerHTML = '<button type="button" class="btn btn-danger btn-vote" name="button" onclick="voteSummoner('+"'"+summoner.summonerid+"', '"+summoner.region+"', '"+channel_name+"', "+-1+')"><i class="fa fa-arrow-down"></button>';
    downvote.className = "text-center";

  }
}

  //Show an error message
  function showError(message){
    errorBox.style.display = "inherit";
    errorMessage.innerHTML = message;
  }

  //Hide the error message
  function hideError(){
    errorBox.style.display = "none";
    errorMessage.innerHTML = "";
  }
