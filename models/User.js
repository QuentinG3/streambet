var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

/*
# CONSTANT #
*/

CHALLENGER_ELO = 2200
MASTER_ELO = 2000
DIAMOND_ELO = 1800
PLATINUM_ELO = 1500
GOLD_ELO = 1200
SILVER_ELO = 900

DEFAULT_ELO = 1200

CHALLENGER = "CHALLENGER"
MASTER = "MASTER"
DIAMOND = "DIAMOND"
PLATINUM = "PLATINUM"
GOLD = "GOLD"
SILVER = "SILVER"
BRONZE = "BRONZE"

var User = new Schema({
  name : {type: String, unique: true, required: true},
  username: {type: String, unique: true, required: true},
  email: {type: String, unique: true, required: true},
  elo: {type: Number, default: DEFAULT_ELO},
  birth_date: {type: Date, required: true}

});

// Add { password: String } to schema
User.plugin(require('mongoose-bcrypt'));

User.methods.bDay = function(){
  var day = this.birth_date.getDate();
  if (day < 10){
    day = "0" + day.toString();
  }
  var month = this.birth_date.getMonth() + 1;
  if (month < 10){
    month = "0" + month.toString();
  }
  var year = this.birth_date.getFullYear();

  return day + " / " + month + " / " + year;
}

User.methods.day = function(){
  var day = this.birth_date.getDate();
  if (day < 10){
    day = "0" + day.toString();
  }
  return day;
}

User.methods.month = function(){
  var month = this.birth_date.getMonth() + 1;
  if (month < 10){
    month = "0" + month.toString();
  }
  return month;
}

User.methods.division = function(){
  if (this.elo >= CHALLENGER_ELO){
    return CHALLENGER
  }
  else if (this.elo >= MASTER_ELO){
	   return MASTER
  }
	 else if (this.elo >= DIAMOND_ELO){
	    return DIAMOND
  }
	else if (this.elo >= PLATINUM_ELO){
		return PLATINUM
  }
	else if (this.elo >= GOLD_ELO){
		return GOLD
  }
	else if (this.elo >= SILVER_ELO){
		return SILVER
  }
	else{
		return BRONZE
  }
}

module.exports = mongoose.model('User', User);
