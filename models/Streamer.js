var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Summoner = new Schema({
  name:   String,
  region:  String,
  summonerId: Number,
});


var Streamer = new Schema({
  name:   String,
  channelName:  String,
  online: Boolean,
  viewers: Number,
  preview: String,
  summoners: [Summoner],
  create_date: { type: Date, default: Date.now }

});


module.exports = mongoose.model('Streamer', Streamer);
