var User = require('../models/User');
var passport = require('passport');

var email_regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
var username_regex = /^[_A-z0-9]{3,}$/;

module.exports = {

  //TODO : Function login and check if user connected or not
  /* Show login section  */
  login : function(req, res, next) {
    res.render('login', {});
  },

  //TODO : Function Signup and check if user connected or not
  /* Show signup section  */
  signup : function(req, res, next) {
    res.render('signup', {});
  },

  /* Register a new account  */
  registerAccount : function(req, res, next) {
    var error_list = [];

    //Data
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var confirm = req.body.confirm;
    var day = req.body.day;
    var month = req.body.month;
    var year = req.body.year;
    var birthDate = null;

    //Verification
    var valid = true;
    //Email
    if(!email || email == "" || !email_regex.test(email)){
      valid = false;
      error_list.push("Enter a valid email.");
    }
    //Username
    if(!username || username == "" || !username_regex.test(username)){
      valid = false;
      error_list.push("Enter a valid username.");
    }
    //Password
    if(!password || password == ""){
      valid = false;
      error_list.push("Enter a password.");
    }else if (password.length < 3){
      valid = false;
      error_list.push("Your password must contain at least 3 characters.");
    }
    //Confirm
    if(!confirm || confirm == ""){
      valid = false;
      error_list.push("Enter your password confirmation.");
    }else if(password != confirm){
      valid = false;
      error_list.push("Passwords doesn't match.");
    }
    //Birthdate
    if(!day || !month || !year || day == "" || month == "" || year == ""){
      valid = false;
      error_list.push("Verify your age.");
    }else{
      birthDate = new Date(parseInt(year), parseInt(month)-1, parseInt(day));
      //Valid birthdate
      if(birthDate.getFullYear() != parseInt(year) || birthDate.getMonth() != (parseInt(month)-1) || birthDate.getDate() != parseInt(day)){
        valid = false;
        error_list.push("Enter a valid birthdate1.");
      }else{
        var now = new Date();
        var tooOld = new Date(now.year-150,0,1);

        //user between 0 and 150
        if(birthDate.getTime() > now.getTime()){
          valid = false;
          error_list.push("Enter a valid birthdate.");
        }else if(birthDate.getTime() < tooOld.getTime()){
          valid = false;
          error_list.push("You can't be that old.");
        }
      }
    }

    console.log(email + " " + username + " " + password + " " + confirm + " " + day + " " + month + " " + year);



    //Database Verification
    //Email and username
    User.findOne({email: email.toLowerCase()}, function(err,emailCheck){
      if(err){
        console.log(err);
      }else{
        User.findOne({username: username.toLowerCase()}, function(err,usernameCheck){
          if(err){
            console.log(err);
          }else{
            if(emailCheck != null){
              valid = false;
              error_list.push("This email is already taken.");
            }
            if(usernameCheck != null){
              valid = false;
              error_list.push("This username is already taken.");
            }

            if(valid){
              //Create user in db
              var newUser = new User({name: username, username: username.toLowerCase(), password: password, email: email.toLowerCase(), birth_date: birthDate});
              newUser.save(function(err){
                if (err) return console.error("Error in user creation in database",err);
                console.log("User well saved");
                //connect user
                passport.authenticate('local')(req, res, function () {
                  console.log("authenticated");
                  res.redirect('/' + req.user.username);
                });

              });

            }else{
              //Render signup page with errors and user inputs
              res.render('signup', {
                error_list: error_list,
                email: email,
                username: username,
                password: password,
                confirm: confirm,
                day: day,
                month: month,
                year: year
              });
            }
          }
        });
      }
    });

  },

  //TODO : Check if user connected or not, and provide user info
  /* Show profil section  */
  profil : function(req, res, next) {
    res.render('profil', {});
  },

  //TODO : check if user connected or not
  recover : function(req, res, next) {
    res.render('recover', {});
  }

}
