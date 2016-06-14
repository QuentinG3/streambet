var database = require('../database/connection');
var adminDebug = require('debug')('admin');

var asyncLoop = function(o){
    var i=-1,
        length = o.length;

    var loop = function(){
        i++;
        if(i==length){o.callback(); return;}
        o.functionToLoop(loop, i);
    }
    loop();//init
}

module.exports = {

    home: function(req, res, next) {
        database.streamer.getAllStreamers()
        .then(function(streamerList){
          console.log(streamerList.length);
          /*
          asyncLoop({
              length : streamerList.length,
              functionToLoop : function(loop, i){
                  database.summoner.getSummonerOfStreamer(streamerList[i])
                  .then(function(list){
                    streamerList[i].summ = list;
                    loop();
                  })
                  .catch(function(error){
                    adminDebug(error);
                    loop();
                  });
              },
              callback : function(){
                  console.log(streamerList);
                  res.render('admin', {streamer_list: streamerList});
              }
          });

          asyncLoop({
              length : 5,
              functionToLoop : function(loop, i){
                  setTimeout(function(){
                      document.write('Iteration ' + i + ' <br>');
                      loop();
                  },1000);
              },
              callback : function(){
                  document.write('All done!');
              }
          });*/

          res.render('admin', {streamer_list: streamerList});
        })
        .catch(function(error){
          adminDebug(error);
          res.render('admin', {error:"Internal error with the database"});
        });

    }

};
