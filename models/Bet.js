var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Bet = new Schema({
  teamIdWin : String,
  amount: Number,
  user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  game : {type: mongoose.Schema.Types.ObjectId, ref: 'Game'}
});


module.exports = mongoose.model('Bet', Bet);
