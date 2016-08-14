var database = require('../database/connection');
var LolApi = require('../api/riotApi').getRiotApi();
var Q = require("q");
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
    },

  validateStreamer: function(req, res){
    //Data
    var user = req.user;
    var channelName = req.body.streamer;

    //Check data
    if(user === undefined || channelName === undefined || channelName === ""){
      res.send({success: false});
    //Check privilege
    }else if(!user.admin){
      res.send({success: false});
    //change validity
    }else{
      //Change the validatation of the streamer
      database.streamer.validateStreamer(channelName)
      .then(function(data){
        res.send({success: true});
      }).catch(function(error){
        adminDebug(error);
        res.send({success: false});
      });
    }
  },

  nameStreamer: function(req, res){
    //Data
    var user = req.user;
    var channelName = req.body.streamer;
    var name = req.body.name;

    //Check data
    if(user === undefined || channelName === undefined || channelName === "" || name === undefined || name === ""){
      res.send({success: false});
    //Check privilege
    }else if(!user.admin){
      res.send({success: false});
    //change name
    }else{
      //Change the name of the streamer
      database.streamer.setNameStreamer(channelName, name)
      .then(function(data){
        res.send({success: true});
      }).catch(function(error){
        adminDebug(error);
        res.send({success: false});
      });
    }
  },

  deleteSummoner: function(req, res){

  },

  addSummoner: function(req, res){
    //Data
    var user = req.user;
    var channelName = req.body.streamer;
    var summonerName = req.body.summonerName;
    var region = req.body.region;

    //Check data
    if(user === undefined || channelName === undefined || channelName === "" ||
       summonerName === undefined || summonerName === "" ||
       region === undefined || region === ""){
      res.send({success: false, error: "Couldn't retrieve information"});
    //Check privilege
    }else if(!user.admin){
      res.send({success: false, error: "You are not an admin"});
    //Add summoner
    }else{
      var summonerGetByNamePromise = Q.denodeify(LolApi.Summoner.getByName);

      //Riot lookup
      summonerGetByNamePromise(summonerName, region)
      .then(function(summoner){
        console.log(summoner);
      //Error with riot lookup
      }).catch(function(error){
        res.send({success: false, error: "error with the summoner"});
        adminDebug(error);
      });
    }
  }
};
