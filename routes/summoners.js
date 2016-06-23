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

  addSummoner: function(req, res){
    //User
    var user = req.user;
    if(user === undefined){
      res.send({success: false, error: "you need to be logged in"});
    }else{
      //Info
      var channelName = req.body.channelName;
      var summonerName = req.body.summonerName.toLowerCase();
      var region = req.body.region;

      //Check info
      if(channelName === undefined || channelName === "" || summonerName === undefined || summonerName === "" || region === undefined || region === ""){
        res.send({success: false, error: "Couldn't retrieve summoner info"});
      }else{
        //Check summoner
        utils.getSummonersId(summonerName, region)
        .then(function(summonerId){
          //Add summoner to db
          database.summoners.addPendingSummoner(summonerName, region, summonerId, channelName)
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
        //error check summoner
        .catch(function(error){
          summonersRouteDebug(error);
          res.send({success: false, error: error});
        });
      }
    }
  },

  voteSummoner: function(req, res){
    var user = req.user;

    res.send({success: true, data: null});
  }
};
