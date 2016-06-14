function voteSummoner(summonerInfo, voteType){
  //Get data
  var summonerID = summonerInfo.split('-')[0];
  var region = summonerInfo.split('-')[1];
  //Post vote
  $.post("/vote-summoner",{
      summoner : summonerID,
      region : region,
      vote : voteType
    },
    function(data, status){
      if(data){
        //Elements
        var count = document.getElementById('count-summ-'+summonerInfo);
        var arrowUp = document.getElementById('arrowUp-summ-'+summonerInfo);
        var arrowDown = document.getElementById('arrowDown-summ-'+summonerInfo);

        //Count change
        if(voteType){
          if(arrowDown.className === "text-center incrementDown"){
            count.innerHTML = parseInt(count.innerHTML) + 2;
          }else{
            count.innerHTML = parseInt(count.innerHTML) + 1;
          }
        }else{
          if(arrowUp.className === "text-center incrementUp"){
            count.innerHTML = parseInt(count.innerHTML) -2;
          }else{
            count.innerHTML = parseInt(count.innerHTML) -1;
          }
        }

        //Arrow change
        if (voteType){
          arrowUp.className = "text-center incrementUp";
          arrowUp.onclick = "";
          arrowDown.className = "text-center increment down";
          arrowDown.onclick = function() {voteSummoner(summonerInfo,false);};
        }else{
          arrowUp.className = "text-center increment up";
          arrowUp.onclick = function() {voteSummoner(summonerInfo,true);};
          arrowDown.className = "text-center incrementDown";
          arrowDown.onclick = "";
        }
      }
  });
}

function voteStreamer(streamerName, voteType){
  //Post vote
  $.post("/vote-streamer",{
      streamer : streamerName,
      vote : voteType
    },
    function(data, status){
      if(data){
        //Elements
        var count = document.getElementById('count-'+streamerName);
        var arrowUp = document.getElementById('arrowUp-'+streamerName);
        var arrowDown = document.getElementById('arrowDown-'+streamerName);

        //Count change
        if(voteType){
          if(arrowDown.className === "text-center incrementDown"){
            count.innerHTML = parseInt(count.innerHTML) + 2;
          }else{
            count.innerHTML = parseInt(count.innerHTML) + 1;
          }
        }else{
          if(arrowUp.className === "text-center incrementUp"){
            count.innerHTML = parseInt(count.innerHTML) -2;
          }else{
            count.innerHTML = parseInt(count.innerHTML) -1;
          }
        }

        //Arrow change
        if (voteType){
          arrowUp.className = "text-center incrementUp";
          arrowUp.onclick = "";
          arrowDown.className = "text-center increment down";
          arrowDown.onclick = function() {voteStreamer(streamerName,false);};
        }else{
          arrowUp.className = "text-center increment up";
          arrowUp.onclick = function() {voteStreamer(streamerName,true);};
          arrowDown.className = "text-center incrementDown";
          arrowDown.onclick = "";
        }
      }
  });
}
