var database = require('../database/connection');
var utils = require('./utils');
var summonersRouteDebug = require('debug')('summonersRoute');

module.exports = {
  pendingList: function(req, res){
    var user = req.user;
    var channelName = req.params.name;

    //Get pending summoners of streamer
    database.summoners.getPendingSUmmonerOfStreamer(channelName)
    .then(function(summoner_list){
      res.send({success: true, data:summoner_list});
    })
    //Error in getting summoners
    .catch(function(error){
      summonersRouteDebug(error);
      res.send({success: false, error:"Internal error with the database"});
    });

  },

  getSummoner: function(req, res){
    console.log("Request");
    //User
    var user = req.user;
    if(user === undefined){
      res.send({success: false, error: "you need to be logged in"});
    }else{
      //Info
      var channelName = req.body.channelName;
      var summonerName = req.body.summonerName.toLowerCase().replace(/\s/g, '');
      var region = req.body.region;

      //Check info
      if(channelName === undefined || channelName === "" || summonerName === undefined || summonerName === "" || region === undefined || region === ""){
        res.send({success: false, error: "Couldn't retrieve summoner info"});
      }else{
        //Check summoner with RIOT
        utils.getSummoners(summonerName, region)
        .then(function(summoner){
          //Check summoner in DB
          utils.checkSummonerDB(summoner.id.toString(), region, channelName)
          .then(function(ok){
            //Send summoner info
            summoner.region = region;
            res.send({success: true, summoner:summoner});
          })
          //errror check summoner in db
          .catch(function(error){
            summonersRouteDebug(error);
            res.send({success: false, error: error});
          });

        })
        //error check summoner
        .catch(function(error){
          summonersRouteDebug(error);
          res.send({success: false, error: error});
        });
      }
    }
  },

  addSummoner: function(req, res){
    //User
    var user = req.user;
    if(user === undefined){
      res.send({success: false, error: "you need to be logged in"});
    }else{
      //Info
      var channelName = req.body.channelName;
      var summonerName = req.body.summonerName.toLowerCase().replace(/\s/g, '');
      var region = req.body.summonerRegion;

      //Check info
      if(channelName === undefined || channelName === "" || summonerName === undefined || summonerName === "" || region === undefined || region === ""){
        res.send({success: false, error: "Couldn't retrieve summoner info"});
      }else{

        //Check summoner
        utils.getSummoners(summonerName, region)
        .then(function(summoner){
          //Check summoner in DB
          utils.checkSummonerDB(summoner.id.toString(), region, channelName)
          .then(function(ok){
            //Add summoner to db
            database.summoners.addPendingSummoner(summoner.name, region, summoner.id, channelName)
            .then(function(){
              //retrieve list of summoner
              database.summoners.getPendingSummonerOfStreamer(channelName)
              .then(function(summonerList){
                res.send({success:true, summonerList: summonerList});
              })
              //error retrieve pending list summoner
              .catch(function(error){
                summonersRouteDebug(error);
                res.send({success:false, error: "Internal error with the database"});
              });
            })
            //error add summoner
            .catch(function(error){
              summonersRouteDebug(error);
              res.send({success: false, error: summonerName+" couldn't be added"});
            });
          })
          //Error when checking summoner in DB
          .catch(function(error){
            summonersRouteDebug(error);
            res.send({success: false, error: error});
          });
        })
        //error check summoner
        .catch(function(error){
          summonersRouteDebug(error);
          res.send({success: false, error: error});
        });
      }
    }
  },

  voteSummoner: function(req, res){
    //Retrieve user
    var user = req.user;
    if(user === undefined){
      res.send({success: false, error: "you need to be logged in"});
    }else{
      //Info
      var streamer = req.body.streamer;
      var summonerID = req.body.ID;
      var region = req.body.region;
      var vote = req.body.vote;

      //Check info
      if(streamer === undefined || streamer === "" || summonerID === undefined || summonerID === "" || region === undefined || region === "" || vote === undefined || vote === ""){
        res.send({success: false, error: "Couldn't retrieve summoner info"});
      }else{
        //Vote for the summoner
        database.summoners.voteSummoner(user.username, streamer, summonerID, region, parseInt(vote))
        .then(function(result){
          res.send({success: true});
        })
        .catch(function(error){
          summonersRouteDebug(error);
          res.send({success: false, error: "Couldn't vote"});
        });
      }
    }
  }
};
