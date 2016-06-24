//Elements
var summonerTable = document.getElementById("summonerTable");
var errorBox = document.getElementById("errorBox");
var errorMessage = document.getElementById("errorMessage");

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
    upvote.innerHTML = '<button type="button" class="btn btn-success" name="button"><i class="fa fa-arrow-up"></button>';
    upvote.className = "text-center";
    downvote.innerHTML = '<button type="button" class="btn btn-danger" name="button"><i class="fa fa-arrow-down"></button>';
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
            //Reload summoner list
            reloadSummonerList(data.summonerList);
            //Hide error
            hideError();
            //clear summonder name field
            document.getElementById("inputSummonerName").value = "";
          }else{
            //Show an error message
            showError(data.error);
          }
        });
        e.preventDefault();	//STOP default action
      }
    });
  });
