var apiUpdate = require('./apiUpdate');
var async = require("async");
var RateLimiter = require('limiter').RateLimiter;

//DEPENDS ON THE API KEY LEVEL
REQUEST_PER_SMALL = 10;
REQUEST_PER_BIG = 500;

WAIT_SECONDS_SMALL = 20;
WAIT_SECONDS_BIG = 60*11;

var riotAPILimitSmall = new RateLimiter(REQUEST_PER_SMALL, WAIT_SECONDS_SMALL*1000);
var riotAPILimitBig = new RateLimiter(REQUEST_PER_BIG, WAIT_SECONDS_BIG*1000);


INTERVAL_BETWEEN_UPDATE_SECONDS = 5;
//var io;
var entierUpdateRoutine = function(io){
  async.series({
    one: function(callbackFinal){
      apiUpdate.updateStreamers(callbackFinal);
    },
    two: function(callbackFinal){
      apiUpdate.updateCurrentGames(callbackFinal,riotAPILimitSmall,riotAPILimitBig,io);
    }/*,
    three: function(callbackFinal){
      apiUpdate.processBet(callbackFinal,riotAPILimitSmall,riotAPILimitBig,io);
    }*/
},
function(err, results) {
  if (err) console.error("Error in entier routine "+ err,err);
    console.log("Done with whole api update routines");
    setTimeout(function(){entierUpdateRoutine(io);},INTERVAL_BETWEEN_UPDATE_SECONDS*1000);
});
}

startApiRoutineLoop = function(io){
  //io = ioIn;
  setTimeout(function(){entierUpdateRoutine(io);},INTERVAL_BETWEEN_UPDATE_SECONDS*1000);
}


module.exports = {
  startApiRoutineLoop : startApiRoutineLoop
}
