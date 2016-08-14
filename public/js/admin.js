var summonerError = document.getElementById("summoner-error");
var summonerErrorText = document.getElementById("summoner-error-text");

/* Validate - Unvalidate the streamer */
function validateStreamer(channelName){
  //Button
  var button = document.getElementById("validate-"+channelName);
  //Box
  var box = document.getElementById("box-"+channelName);
  //Send info to server
  $.post("validateStreamer",{streamer: channelName},function(data, status){
    if(data.success){
      //do nothing
    }else{
      //rechange button
      switchButton(button);
      //rechange box in table
      switchBox(box);
    }
  });
  //Change button
  switchButton(button);
  //Box
  switchBox(box);
}

/* Change name of the streamer */
function nameStreamer(channelName){
  //TextField
  var input = document.getElementById("input-name-"+channelName);
  var newName = input.value;
  //Name in table
  var nameTable = document.getElementById("table-name-"+channelName);
  var oldName = nameTable.innerHTML;
  nameTable.innerHTML = newName;

  //Send info to server
  $.post("nameStreamer",{streamer: channelName, name: newName},function(data, status){
    if(data.success){
      //do nothing
    }else{
      //Switch input
      input.value = oldName;
      //Switch tableName
      nameTable.innerHTML = oldName;
    }
  });

  return false;
}

/* Add Summoner */
function addSummoner(channelName){
  //Hide error
  summonerError.style.display = "none";

  //SummonerName
  var inputName = document.getElementById("input-summoner-"+channelName);
  var name = inputName.value;
  //Region
  var inputRegion = document.getElementById("input-region-"+channelName);
  var region = inputRegion.options[inputRegion.selectedIndex].value;

  //Send info to server
  $.post("addSummoner",{streamer: channelName, summonerName: name, region: region},function(data, status){
    if(data.success){
      //Add summoner

    }else{
      //Show error
      summonerErrorText.innerHTML = data.error;
      summonerError.style.display = "inherit";
    }
  });

  return false;
}


/* Switch the button */
function switchButton(button){
  if(button.className === "btn btn-danger center-block"){
    button.className = "btn btn-success center-block";
    button.innerHTML = '<i class="fa fa-check"></i> Validate';
  }else{
    button.className = "btn btn-danger center-block";
    button.innerHTML = '<i class="fa fa-times"></i> Unvalidate';
  }
}


/* Switch the box */
function switchBox(box){
  if(box.className === "text-center on"){
    box.className = "text-center off";
    box.innerHTML = '<p style="display:none;">n</p><i class="fa fa-times" style="color:red;"></i>';
  }else{
    box.className = "text-center on";
    box.innerHTML = '<p style="display:none;">y</p><i class="fa fa-check" style="color:green;"></i>';
  }
}
