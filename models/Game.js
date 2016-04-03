var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Players = new Schema({
  summonerName: String,
  championName:String,
  teamId:String,
  summonerId:String,
  spell1:String,
  spell2:String,
  rank: String,
  finalMasteryId:String
});

var BannedChampions = new Schema({
  name: String,
  teamId:String
});

var Game = new Schema({
  gameId : String,
  region:String,
  summonersName:String,
  timestamp : Number,
  teamId : String,
  amount100 : Number,
  amount200 : Number,
  streamer : {type: mongoose.Schema.Types.ObjectId, ref: 'Streamer'},
  bannedChampions :[BannedChampions],
  players:[Players]
});



module.exports = mongoose.model('Game', Game);
