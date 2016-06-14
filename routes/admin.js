var database = require('../database/connection');
var adminDebug = require('debug')('admin');

module.exports = {

    home: function(req, res, next) {
        database.streamer.getAllStreamers()
        .then(function(streamerList){
          streamerList.forEach(function(item, index){
            database.summoners.getSummonerOfStreamer(item.channelname)
            .then(function(list){
              item['summonerList'] = list;
              if(index == streamerList.length-1){
                res.render('admin', {
                  streamer_list: streamerList,
                  isAuthenticated: req.isAuthenticated(),
                  user: req.user});
              }
            })
            .catch(function(error){
              adminDebug(error);
            })
          });
        })
        .catch(function(error){
          adminDebug(error);
          res.render('admin', {
            error:"Internal error with the database",
            isAuthenticated: req.isAuthenticated(),
            user: req.user});
        });

    }

};
