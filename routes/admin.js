var database = require('../database/connection');
var adminDebug = require('debug')('admin');

module.exports = {

    home: function(req, res, next) {
        database.streamer.getAllStreamers()
        .then(function(streamerList){
          res.render('admin', {streamer_list: streamerList});
        })
        .catch(function(error){
          adminDebug(error);
          res.render('admin', {error:"Internal error with the database"});
        });

    }

};
