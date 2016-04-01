var start = 0;
var end = 0;
var diff = 0;
var timerID = 0;
function chrono(){
	end = new Date();
	diff = end - start;
	diff = new Date(diff);
	var sec = diff.getSeconds();
	var min = diff.getMinutes() + (diff.getHours()-1)*60;
	if (min < 10){
		min = "0" + min;
	}
	if (sec < 10){
		sec = "0" + sec;
	}
	document.getElementById("chronotime").innerHTML = min + ":" + sec;
	timerID = setTimeout("chrono()", 1000);
}

function chronoStart(timestamp){
	clearTimeout(timerID);
	start = new Date(timestamp);
	chrono();
}

function chronoReset(){
	clearTimeout(timerID);
	document.getElementById("chronotime").innerHTML = "00:00";

}