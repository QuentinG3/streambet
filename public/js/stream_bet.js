/*
 ____       _
|  _ \     | |
| |_) | ___| |_
|  _ < / _ \ __|
| |_) |  __/ |_
|____/ \___|\__|
*/

function redModal() {
    if (!isAuthenticated) {
        connectView();
    } else {
        bodyView();
    }
    $("#modal-red").modal({
        backdrop: "static"
    });
}

function blueModal() {
    if (!isAuthenticated) {
        connectView();
    } else {
        bodyView();
    }
    $("#modal-blue").modal({
        backdrop: "static"
    });
}

function betRed() {
    //Emit bet
    var amount = parseInt(RedSelectedAmount.options[RedSelectedAmount.selectedIndex].value);
    socket.emit('placeBet', {
        streamer: channel_name,
        team: NON_STREAMER_TEAM,
        amount: amount
    });

    //Put the view in already bet mode
    userBetTeam = NON_STREAMER_TEAM;
    userBetAmount = amount;
    //alreadyBetView();

    //Modal in loading State
    loadingView();

    //Follow socket.on("betResponse");
}

function betBlue() {
    //Emit bet
    var amount = parseInt(BlueSelectedAmount.options[BlueSelectedAmount.selectedIndex].value);
    socket.emit('placeBet', {
        streamer: channel_name,
        team: STREAMER_TEAM,
        amount: amount
    });

    //Put the view in already bet mode
    userBetTeam = STREAMER_TEAM;
    userBetAmount = amount;
    //alreadyBetView();

    //Modal in loading State
    loadingView();

    //Follow socket.on("betResponse");
}

function updateBetAmount(amountBlue, amountRed) {

    //Total
    BlueBetAmount.innerHTML = amountBlue;
    RedBetAmount.innerHTML = amountRed;
    var bluePercent = 50;
    var redPercent = 50;

    if (amountBlue > 0 || amountRed > 0) {
        bluePercent = (amountBlue / (amountBlue + amountRed)) * 100;
        redPercent = 100 - bluePercent;
    }

    //Progress bar
    RightProgress.style.width = bluePercent + "%";
    LeftProgress.style.width = redPercent + "%";

    //Potential gain
    if (userBetTeam !== 0 && userBetAmount !== 0) {
        if (userBetTeam == TEAM_LEFT) {
            if (amountBlue > 0) {
                RightGain.innerHTML = -userBetAmount;
            } else {
                RightGain.innerHTML = 0;
            }
            LeftGain.innerHTML = "+" + Math.ceil((userBetAmount / amountRed) * amountBlue);
        } else {
            if (amountRed > 0) {
                LeftGain.innerHTML = -userBetAmount;
            } else {
                LeftGain.innerHTML = 0;
            }
            RightGain.innerHTML = "+" + Math.ceil((userBetAmount / amountBlue) * amountRed);
        }

    }

}
