var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Game = new Schema({
  gameId : String,
  timestamp : Number,
  teamId : String,
  amount100 : Number,
  amount200 : Number,
});

var Summoner = new Schema({
  name:   String,
  region:  String,
  summonerId: String,
});


var Streamer = new Schema({
  name:   String,
  channelName:  String,
  online: Boolean,
  viewers: Number,
  preview: String,
  summoners: [Summoner],
  create_date: {type: Date, default: Date.now}

});

module.exports = mongoose.model('Streamer', Streamer);
