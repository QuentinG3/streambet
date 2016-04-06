var mongoose = require('mongoose');
var Schema = mongoose.Schema;


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
    return num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}


module.exports = mongoose.model('Streamer', Streamer);
