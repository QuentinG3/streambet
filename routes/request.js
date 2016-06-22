var database = require('../database/connection');
var requestDebug = require('debug')('request');
var utils = require('./utils');

module.exports = {
    requests: function(req, res, next) {
      if(req.isAuthenticated()){
        //Get non valid streamers
        database.streamer.getUnvalidStreamers()
        .then(function(streamerList){
          //If no streamers
          if(streamerList.length === 0){
            //Get regions
            database.region.getRegion()
            .then(function(regionList){
              //Render the page
              res.render('requests', {
                  streamer_list : streamerList,
                  region_list : regionList,
                  isAuthenticated: req.isAuthenticated(),
                  user: req.user
              });
            })
            //Catch region
            .catch(function(error){
              adminDebug(error);
            });
          }
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
                  //Renger the page
                  res.render('requests', {
                      streamer_list : streamerList,
                      region_list : regionList,
                      isAuthenticated: req.isAuthenticated(),
                      user: req.user
                  });
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
        .catch(function(error){
          requestDebug(error);
        });
      }else{
        res.redirect('/login');
      }
    },

    addStreamer: function(req, res){
      var user = req.user;
      var valid = true;
      var error_list = [];
      //Input
      var channelname = req.body.channelName;
      var summonerName = [];
      var regionCode = [];

      //SummonersName
      var summoners = req.body.summonerName;
      for (var i = 1; i < summoners.length; i++) {
        if(summoners[i] !== "" && summoners[i] !== undefined)
          summonerName.push(summoners[i]);
      }
      //RegionsCode
      var regions = req.body.regionCode;
      for (i = 1; i < regions.length; i++) {
        if(regions[i] !== "" && regions[i] !== undefined)
          regionCode.push(regions[i]);
      }

      //Check streamer
      if(channelname === "" || channelname === undefined){
        valid = false;
        error_list.push("Please enter a twitch channel name");
      }

      //Check summoners and region
      if(summonerName.length === 0 || regionCode.length === 0){
        valid = false;
        error_list.push("Please enter at least one summoner");
      }

      //if not valid
      if(!valid){
        return res.send({success: false, error_list: error_list});
      }

      //Check streamer exist
      utils.streamerExist(channelname)
      .then(function(exist){
        if(exist){
          console.log("streamer");
          res.send({success: true});
          //check streamer not in db
          //check summoner exist
          //check summoner not in db
          //Create streamer
          //database.streamer.addStreamer(name, channelname, preview, valid)
          //Create summoner
          //database.summoners.addSummoner(name, region, id, streamer, valid)
        }else{
          console.log("no streamer");
          return res.send({success: false, error_list: "streamer does not exist"});
        }
      }).catch(function(error){
        requestDebug(error);
      });
    },

    voteStreamer : function(req,res){
      //DATA
      var user = req.user;
      var streamer = req.body.streamer;
      var vote = req.body.vote;

      //Check user
      if(user === undefined)
        return res.send(false);

      //Check data
      if(!streamer || streamer === "" || !vote || vote === "")
        return res.send(false);

      //Check Entry exist

      //Check Already vote

      //Create new Entry vote
      return res.send(true);
    },

    voteSummoner : function(req,res){
      //DATA
      var user = req.user;
      var summoner = req.body.summoner;
      var region = req.body.region;
      var vote = req.body.vote;

      //Check user
      if(user === undefined)
        return res.send(false);

      //Check data
      if(!summoner ||summoner === "" || !region || region === "" || !vote || vote === "")
        return res.send(false);

      //Check Entry exist

      //Check Already vote

      //Create new Entry vote
      return res.send(true);
    }

};
