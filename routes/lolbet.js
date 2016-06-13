var base = require('./base');
var database = require('../database/connection');

var lolbetRoutesDebug = require('debug')('lolbetRoutes');

module.exports = {

    /* Show the online lol streamer.  */
    streamers: function(req, res, next) {
      database.streamer.getOnlineStreamersSorted()
      .then(function(streamerList){
        res.render('streamers', {
            streamer_list: streamerList,
            isAuthenticated: req.isAuthenticated(),
            host: req.headers.host,
            user: req.user
        });
      })
      .catch(function(error){
        lolbetRoutesDebug(error);
      });
    },

    /* Show the stream, game info and bet system. */
    //TODO check if streamer is online?
    stream: function(req, res, next) {
        //Getting the streamer name
        var name = req.params.name;

        //Database lookup
        database.streamer.getStreamerByChannelName(name)
        .then(function(streamer){
          if (streamer) {
            database.summoners.getSummonerOfStreamer(name)
            .then(function(summonersList){
              res.render('stream', {
                  streamer: streamer,
                  summonersList: summonersList,
                  bet_range: [5,10,15,20],
                  isAuthenticated: req.isAuthenticated(),
                  user: req.user
              });
            })
            .catch(function(error){
              res.status(404);
              res.render('404', {
                  user: req.user,
                  isAuthenticated: req.isAuthenticated(),
                  url: req.url
              });
              lolbetRoutesDebug(error);
            });
          } else {
              res.status(404);
              res.render('404', {
                  user: req.user,
                  isAuthenticated: req.isAuthenticated(),
                  url: req.url
              });
          }
        })
        .catch(function(error){
          res.status(404);
          res.render('404', {
              user: req.user,
              isAuthenticated: req.isAuthenticated(),
              url: req.url
          });
          lolbetRoutesDebug(error);
        });
    },

    /* Show the ranking of the best player of the website. */
    ranking: function(req, res, next) {
        database.users.getBestUser()
        .then(function(list){
          res.render('ranking', {
              player_list: list,
              isAuthenticated: req.isAuthenticated(),
              user: req.user
          });
        })
        .catch(function(error){
          res.render('ranking', {
              isAuthenticated: req.isAuthenticated(),
              user: req.user
          });
          lolbetRoutesDebug(error);
        });
    },

    requests: function(req, res, next) {
      if(req.isAuthenticated()){
        res.render('requests', {
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
      }else{
        res.redirect('/login');
      }

    }

};
