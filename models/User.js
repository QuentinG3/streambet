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

CHALLENGER = "challenger"
MASTER = "master"
DIAMOND = "diamond"
PLATINUM = "platinum"
GOLD = "gold"
SILVER = "silver"
BRONZE = "bronze"

var User = new Schema({
    name : {type: String, unique: true, required: true},
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    elo: {type: Number, default: DEFAULT_ELO},
    birth_date: {type: Date, required: true}
});

User.plugin(require('mongoose-bcrypt'));

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
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
