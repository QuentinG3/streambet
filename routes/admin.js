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
    //Data
    var user = req.user;
    var summonerId = req.body.summonerId;
    var region = req.body.region;

    //Check data
    if(user === undefined || summonerId === undefined || summonerId === "" ||
       region === undefined || region === ""){
      res.send({success: false, error: "Couldn't retrieve information"});
    //Check privilege
    }else if(!user.admin){
      res.send({success: false, error: "You are not an admin"});
    //Delete summoner
    }else{
      database.summoners.deleteSummoner(summonerId,region)
      .then(function(data){
        res.send({success: true});
      }).catch(function(error){
        adminDebug(error);
        res.send({success: false, error: "Couldn't delete the summoner"});
      })
    }
  },

  addSummoner: function(req, res){
    //Data
    var user = req.user;
    var channelName = req.body.streamer;
    var summonerName = req.body.summonerName.toLowerCase().replace(/\s/g, '');
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
      .then(function(summonerData){
        var summoner = summonerData[summonerName];
        //Check if summoner lvl 30
        if (summoner.summonerLevel !== 30){
          res.send({success: false, error: "Summoner isn't level 30"});
        }else{
          //Add summoner to the database
          database.summoners.addValidSummoner(summoner.name, region, summoner.id, channelName)
          .then(function(data){
            res.send({success: true, summonerName: summoner.name, region: region, summonerId: summoner.id});
          //Error while adding summoner in db
          }).catch(function(error){
            adminDebug(error);
            res.send({success: false, error: "Error while adding the summoner in db"});
          })
        }
      //Error with riot lookup
      }).catch(function(error){
        res.send({success: false, error: "error with the summoner"});
        adminDebug(error);
      });
    }
  }
};
