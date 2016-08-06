var apiUpdate = require('./apiUpdate');
var async = require("async");


INTERVAL_BETWEEN_UPDATE_SECONDS = 10;

//var io;
var entierUpdateRoutine = function(io) {
    async.series({
            one: function(callbackFinal) {
                apiUpdate.updateStreamersDatabase(callbackFinal);
            },
            two: function(callbackFinal) {
                apiUpdate.updateStreamers(callbackFinal);
            },
            three: function(callbackFinal) {
                apiUpdate.updateCurrentGames(callbackFinal, io);
            },
            four: function(callbackFinal) {
                apiUpdate.processBet(callbackFinal, io);
            }
        },
        function(err, results) {
            if (err) console.error("Error in entier routine " + err, err);
            console.log("Done with whole api update routines");
            setTimeout(function() {
                entierUpdateRoutine(io);
            }, INTERVAL_BETWEEN_UPDATE_SECONDS * 1000);
        });
};

startApiRoutineLoop = function(io) {
    //io = ioIn;
    setTimeout(function() {
        entierUpdateRoutine(io);
    }, INTERVAL_BETWEEN_UPDATE_SECONDS * 1000);
};

startApiRoutineUpdateStreamer = function() {
    setTimeout(function() {
        entierUpdateRoutine(io);
    }, INTERVAL_BETWEEN_STREAMER_UPDATE * 1000);
};


module.exports = {
    startApiRoutineLoop: startApiRoutineLoop,
    startApiRoutineUpdateStreamer: startApiRoutineUpdateStreamer
};
