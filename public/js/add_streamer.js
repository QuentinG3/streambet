var summoner_length = 0;
var summoner_list = document.getElementById("summonerList");

function addSummoner() {
	//Length +1
	summoner_length += 1;

    //Change template label
    document.getElementById("summonerNumber").innerHTML = summoner_length.toString();
    //Change template input ID
    var summoner_input = document.getElementById("inputSummonerName");
    summoner_input.id += summoner_length.toString();

		//Clone element
    var itm = document.getElementById("summoner_template");
    var cln = itm.cloneNode(true);

    //Undo input ID change
    summoner_input.id = "inputSummonerName";
    //Change template ID
    cln.id = summoner_length;

    //Display
    cln.style.display = "inherit";
    //Add element to the list
    summoner_list.appendChild(cln);

    //Change focus
    if(summoner_length > 1){
    	document.getElementById("inputSummonerName"+summoner_length.toString()).focus();
	}
}

function deleteSummoner() {
	if (summoner_length > 1){
		//Length -1
		summoner_length -= 1;
		//Delete element
		summoner_list.removeChild(summoner_list.lastChild);
		//Change focus
    	document.getElementById("inputSummonerName"+summoner_length.toString()).focus();
	}
}

addSummoner();
