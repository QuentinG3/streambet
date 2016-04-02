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


Streamer.methods.viewersComma = function(){
  return commafy(this.viewers);
}

function commafy( num ) {
    var str = num.toString().split('.');
    if (str[0].length >= 5) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
}


module.exports = mongoose.model('Streamer', Streamer);
