var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Streamer = new Schema({
  name:   String,
  channel_name:  String,
  online: Boolean,
  viewers: Number,
  preview: String,
  create_date: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Streamer', Streamer);
