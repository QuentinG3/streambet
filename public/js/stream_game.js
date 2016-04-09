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

/* Update the timstamp below the stream */
function updateTimeStamp(data) {
    //Start chrono
    if (data > 0) {
        chronoStart(data);
    } else {
        chronoReset();
    }
}

/* Update game info */
function updateGame(object) {

    //Start chrono
    updateTimeStamp(object.timestamp);

    //Update current game
    var player = object.players;
    var bannedChamp = object.bannedChampions;

    //Update streamer info
    streamer_info.innerHTML = "- " + object.summonerName + " (" + object.region + ")";

    //Champion index
    var r = 0;
    var b = 0;
    for (var i = 0; i < player.length; i++) {
        //Red team
        if (player[i].teamid == TEAM_LEFT) {
            //Set picture
            LeftPicture[r].src = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + player[i].championname + "_0.jpg";
            //Set name
            LeftName[r].innerHTML = player[i].summonername;
            LeftName[r].title = player[i].summonername;
            //Set Summoner link
            LeftName[r].href = "http://www.lolking.net/summoner/" + object.region + "/" + player[i].summonerid;
            //Set Mastery
            if (player[i].finalmasteryid < 0) {
                LeftMastery[r].src = "/static/lolbet/img/no-mastery.png";
            } else {
                LeftMastery[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/mastery/" + player[i].finalmasteryid + ".png";
            }
            //Set spell1 spell2
            LeftSpell1[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/" + player[i].spell1 + ".png";
            LeftSpell2[r].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/" + player[i].spell2 + ".png";
            //Set rank
            LeftRank[r].src = "/img/rank/" + player[i].rank + ".png";
            r++;
        }

        //Blue team
        if (player[i].teamid == TEAM_RIGHT) {
            //Set picture
            RightPicture[b].src = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + player[i].championname + "_0.jpg";
            //Set name
            RightName[b].innerHTML = player[i].summonername;
            RightName[b].title = player[i].summonername;
            //Set Summoner link
            RightName[b].href = "http://www.lolking.net/summoner/" + object.region + "/" + player[i].summonerid;
            //Set Mastery
            if (player[i].finalmasteryid < 0) {
                RightMaster[b].src = "/static/lolbet/img/no-mastery.png";
            } else {
                RightMaster[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/mastery/" + player[i].finalmasteryid + ".png";
            }
            //Set spell1 spell2
            RightSpell1[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/" + player[i].spell1 + ".png";
            RightSpell2[b].src = "http://ddragon.leagueoflegends.com/cdn/6.1.1/img/spell/" + player[i].spell2 + ".png";
            //Set rank
            RightRank[b].src = "/img/rank/" + player[i].rank + ".png";
            b++;
        }
    }

    //Update Streamer team
    STREAMER_TEAM = object.teamOfSummoner;
    if (STREAMER_TEAM === 100) {
        NON_STREAMER_TEAM = 200;
    } else {
        NON_STREAMER_TEAM = 100;
    }


    //Update View
    if (STREAMER_TEAM == TEAM_LEFT) {
        blueLeft();
    } else {
        blueRight();
    }

}
