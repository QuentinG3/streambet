/* jshint esversion : 6*/

var User = require('../models/User');
var Streamer = require('../models/Streamer');
var passport = require('passport');
var validator = require("email-validator");
var https = require('https');

var database = require('../database/connection');

var email_regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
var username_regex = /^[_A-z0-9]{3,}$/;

const CAPTCHA_API_KEY = "6LdS0hwTAAAAAApkTHy8_QmUbcapYk6LwDJ2BExD";

function verifyRecaptcha(key, callback) {
    https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + CAPTCHA_API_KEY + "&response=" + key, function(res) {
        var data = "";
        res.on('data', function(chunk) {
            data += chunk.toString();
        });
        res.on('end', function() {
            try {
                var parsedData = JSON.parse(data);
                callback(parsedData.success);
            } catch (e) {
                callback(false);
            }
        });
    });
}

module.exports = {

    /* Show login section  */
    login: function(req, res, next) {
        if (!req.isAuthenticated())
            res.render('login', {});
        else
            res.redirect('/');
    },

    /* Log the user */
    logUser: function(req, res, next) {
        var error_list = [];

        //Data
        var username = req.body.username;
        var password = req.body.password;

        //Verficiation
        var valid = true;
        //username
        if (!username || username === "") {
            valid = false;
            error_list.push("Enter a username.");
        }
        //password
        if (!password || password === "") {
            valid = false;
            error_list.push("Enter a password.");
        }

        if (!valid) {
            res.render('login', {
                username: username,
                error_list: error_list
            });
        } else {

            //passport login user
            passport.authenticate('local', function(err, user, info) {
                //Error
                if (err) {
                    return next(err); // will generate a 500 error
                }
                //Fail to log user
                if (!user) {
                    error_list.push("Username/email or password invalid.");
                    return res.render('login', {
                        username: username,
                        error_list: error_list
                    });
                }
                //Login user
                req.login(user, loginErr => {
                    if (loginErr) {
                        return next(loginErr);
                    }
                    return res.redirect('/');
                });
            })(req, res, next);
        }

    },

    /* Show signup section  */
    signup: function(req, res, next) {
        if (!req.isAuthenticated())
            res.render('signup', {});
        else
            res.redirect('/');
    },

    /* Register a new account  */
    registerAccount: function(req, res, next) {
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
        if (!email || email === "" || !validator.validate(email)) {
            valid = false;
            error_list.push("Enter a valid email.");
        }
        //Username
        if (!username || username === "" || !username_regex.test(username)) {
            valid = false;
            error_list.push("Enter a valid username.");
        }
        //Password
        if (!password || password === "") {
            valid = false;
            error_list.push("Enter a password.");
        } else if (password.length < 3) {
            valid = false;
            error_list.push("Your password must contain at least 3 characters.");
        }
        //Confirm
        if (!confirm || confirm === "") {
            valid = false;
            error_list.push("Enter your password confirmation.");
        } else if (password != confirm) {
            valid = false;
            error_list.push("Passwords doesn't match.");
        }
        //Birthdate
        if (!day || !month || !year || day === "" || month === "" || year === "") {
            valid = false;
            error_list.push("Verify your age.");
        } else {
            birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            //Valid birthdate
            if (birthDate.getFullYear() != parseInt(year) || birthDate.getMonth() != (parseInt(month) - 1) || birthDate.getDate() != parseInt(day)) {
                valid = false;
                error_list.push("Enter a valid birthdate.");
            } else {
                var now = new Date();
                var tooOld = new Date(now.year - 150, 0, 1);

                //user between 0 and 150
                if (birthDate.getTime() > now.getTime()) {
                    valid = false;
                    error_list.push("Enter a valid birthdate.");
                } else if (birthDate.getTime() < tooOld.getTime()) {
                    valid = false;
                    error_list.push("You can't be that old.");
                }
            }
        }

        //Verify captcha
        verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
            if (success) {
                //Database Verification
                //Email and username
                /*
                database.users.getUserByEmail(email.toLowerCase())
                .then(function(emailCheck){
                  database.users.getUserByUsername(username.toLowerCase())
                  .then(function(usernameCheck){

                  })
                  .catch(function(error){

                  });
                })
                .catch(function(error){

                });*/



                User.findOne({
                    email: email.toLowerCase()
                }, function(err, emailCheck) {
                    if (err) {
                        console.log(err);
                    } else {
                        User.findOne({
                            username: username.toLowerCase()
                        }, function(err, usernameCheck) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (emailCheck !== null) {
                                    valid = false;
                                    error_list.push("This email is already taken.");
                                }
                                if (usernameCheck !== null) {
                                    valid = false;
                                    error_list.push("This username is already taken.");
                                }

                                if (valid) {
                                    //Create user in db
                                    var newUser = new User({
                                        name: username,
                                        username: username.toLowerCase(),
                                        password: password,
                                        email: email.toLowerCase(),
                                        birth_date: birthDate
                                    });
                                    newUser.save(function(err) {
                                        if (err) return console.error("Error in user creation in database", err);
                                        //connect user
                                        passport.authenticate('local')(req, res, function() {
                                            res.redirect('/');
                                        });

                                    });

                                } else {
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
            } else {
                error_list.push("The captcha failed.");
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
        });



    },

    /* Show profil section.  */
    profil: function(req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            Streamer.find({}, "channelName name", {
                sort: {
                    name: 1
                }
            }, function(err, streamer_list) {
                if (err) return console.log(err);
                res.render('profil', {
                    streamer_list: streamer_list,
                    isAuthenticated: req.isAuthenticated(),
                    user: req.user
                });
            });
        }
    },

    changeProfil: function(req, res, next) {
        var error_list = [];
        var valid = true;

        /* Edit email */
        if (req.body.email_edit !== undefined) {
            //Data
            var email = req.body.email;

            //Verification
            if (!email || email === "" || !validator.validate(email)) {
                valid = false;
                error_list.push("Enter a valid email.");
            }

            if (valid) {
                User.findOne({
                    email: email.toLowerCase()
                }, function(err, emailCheck) {
                    if (err) console.log(err);
                    else {
                        if (emailCheck !== null && emailCheck.username !== req.user.username) {
                            valid = false;
                            error_list.push("This email is already taken.");
                            res.render('profil', {
                                error_list: error_list,
                                isAuthenticated: req.isAuthenticated,
                                user: req.user
                            });
                        } else {
                            //Update user
                            User.update(req.user, {
                                email: email
                            }, function(err, doc) {
                                if (err) console.log(err);
                                else {
                                    res.redirect('/profil');
                                }
                            });
                        }
                    }
                });

            }
            /* Edit  birthday */
        } else if (req.body.birthdate_edit !== undefined) {
            var day = req.body.day;
            var month = req.body.month;
            var year = req.body.year;
            var birthDate = null;

            //Birthdate
            if (!day || !month || !year || day === "" || month === "" || year === "") {
                valid = false;
                error_list.push("Verify your age.");
            } else {
                birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                //Valid birthdate
                if (birthDate.getFullYear() != parseInt(year) || birthDate.getMonth() != (parseInt(month) - 1) || birthDate.getDate() != parseInt(day)) {
                    valid = false;
                    error_list.push("Enter a valid birthdate.");
                } else {
                    var now = new Date();
                    var tooOld = new Date(now.year - 150, 0, 1);

                    //user between 0 and 150
                    if (birthDate.getTime() > now.getTime()) {
                        valid = false;
                        error_list.push("Enter a valid birthdate.");
                    } else if (birthDate.getTime() < tooOld.getTime()) {
                        valid = false;
                        error_list.push("You can't be that old.");
                    }
                }
            }

            if (valid) {
                //update user
                User.update(req.user, {
                    birth_date: birthDate
                }, function(err, doc) {
                    if (err) console.log(err);
                    else {
                        res.redirect('/profil');
                    }
                });
            }

            /* Edit password */
        } else if (req.body.password_edit !== undefined) {
            var password = req.body.password;
            var confirm = req.body.confirm;

            //Password
            if (!password || password === "") {
                valid = false;
                error_list.push("Enter a password.");
            } else if (password.length < 3) {
                valid = false;
                error_list.push("Your password must contain at least 3 characters.");
            }
            //Confirm
            if (!confirm || confirm === "") {
                valid = false;
                error_list.push("Enter your password confirmation.");
            } else if (password != confirm) {
                valid = false;
                error_list.push("Passwords doesn't match.");
            }

            if (valid) {
                //Encrypt password
                User.encryptPassword(password, function(err, encryptedValue) {
                    if (!err) {
                        //Update user
                        User.update(req.user, {
                            password: encryptedValue
                        }, function(err, doc) {
                            if (err) console.log(err);
                            else {
                                res.redirect('/profil');
                            }
                        });
                    }
                });

            }
        }

        if (!valid) {
            res.render('profil', {
                error_list: error_list,
                isAuthenticated: req.isAuthenticated,
                user: req.user
            });
        }
    },

    /* Recover the user password. */
    //TODO do the post for this section
    recover: function(req, res, next) {
        if (!req.isAuthenticated())
            res.render('recover', {});
        else
            res.redirect('/');
    },

    /* Log off the user. */
    logoff: function(req, res, next) {
        req.logout();
        res.redirect('/');
    }

};
