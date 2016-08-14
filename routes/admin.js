var database = require('../database/connection');
var adminDebug = require('debug')('admin');

module.exports = {

    home: function(req, res, next) {
      var user = req.user;
      if(user === undefined){
        res.status(404);
        res.render('404', {
            user: req.user,
            isAuthenticated: req.isAuthenticated(),
            url: req.url
        });
      }else if(!user.admin){
        res.status(404);
        res.render('404', {
            user: req.user,
            isAuthenticated: req.isAuthenticated(),
            url: req.url
        });
      }else{
        //Get Streamers
        database.streamer.getAllStreamers()
        .then(function(streamerList){
          //For each streamer
          streamerList.forEach(function(item, index){
            //Get summoners
            database.summoners.getSummonerOfStreamer(item.channelname)
            .then(function(list){
              item.summonerList = list;
              if(index == streamerList.length-1){
                //Get regions
                database.region.getRegion()
                .then(function(regionList){
                  res.render('admin', {
                    streamer_list: streamerList,
                    region_list: regionList,
                    isAuthenticated: req.isAuthenticated(),
                    user: req.user});
                })
                //Catch region
                .catch(function(error){
                  adminDebug(error);
                });
              }
            })
            //Catch summoners
            .catch(function(error){
              adminDebug(error);
            });
          });
        })
        //Catch streamers
        .catch(function(error){
          adminDebug(error);
          res.render('admin', {
            error:"Internal error with the database",
            isAuthenticated: req.isAuthenticated(),
            user: req.user});
        });
      }
    }
};
