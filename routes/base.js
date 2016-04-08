var validator = require("email-validator");
var nodemailer = require("nodemailer");

module.exports = {

    /* Redirect to the stream wall page. */
    //TODO home page
    home: function(req, res, next) {
        res.redirect('/streamers');
    },

    //TODO : Get this text from the database ? from text file?
    /* Get the text about the website from a file and show it in the about section. */
    about: function(req, res, next) {
        res.render('about', {
            about: [{
                title: "What is streambet",
                text: "Streambet is an esport betting website based on league of legends streaming. Every time a streamer enter in a ranked game on league of legends, StreamBet users have 5 minutes to bet on one of the team involved. At the end of the game, this bet is processed and the total amount is shared among the winners. We feature the most watched streamers on twitch.tv and we try to maintain their summoners list up-to-date. ",
            }, {
                title: "Who we are",
                text: "We are two belgian computer science students. We study in the Catholic University of Louvain in Belgium. As league of legends players and streaming enthusiast, we decided to develop this website to create a new kind of bet system.",
            }, {
                title: "Future of StreamBet",
                text: "There are a lots of things that we can add to streambet. We will try to add a recommandation system that allow user to add new streamers and summoners. We will also try to add new game to the system like Counter Strike, Hearthstone, ... Feel free ton contact us with any request you have.",
            }],
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    },

    //TODO : Get this text from database ? from text file ?
    /* Get the question and answer from a file and show it in the faq section. */
    faq: function(req, res, next) {
        res.render('faq', {
            faq: [{
                id: 1,
                title: "What is streambet?",
                text: "Streambet is about, streaming, league of legends and bets. With streambet, you can watch your favorite streamer play league of legends and bet on his games while he plays. When the game is over, the credit of those who bet wrong is shared among the winners."
            }, {
                id: 2,
                title: "How does the bet works?",
                text: "You can only bet on ranked game. When a game is found the view will change and you'll be able to bet for one of the team. All bets are closed when the game reach 5 minutes in game. This way we can assure that the betting was fair. When the game is finished, we process the bet and the credit is shared among the winners depending of the amount they bid."
            }, {
                id: 3,
                title: "The streamer is in game, but I can't bet",
                text: "We will only update the view with the bet window when the streamer is in ranked game. The game is either not ranked or we don't feature this particular summoners for the streamer yet. In the second case, please contact us so we can update his summoners list."
            }, {
                id: 4,
                title: "Why is there a delay ?",
                text: "All streams have at least 10-15 seconds delay. Sometimes, streamers add delay to their stream to avoid getting stream sniped. Either way, the 'in game' time you see below the stream is without delay.	"
            }, {
                id: 5,
                title: "Why streambet is only about league of legends?",
                text: "Riot games provides us all the informations we need to implements the game lookup of streamers in real time. As soon as other games provide us with the same kind of information, we will feature them too. Stay tuned!"
            }, {
                id: 6,
                title: "How do you chose the streamers?",
                text: "The streamer list is the most watched streamers on twitch. If you think there is someone missing, please contact us !"
            }],
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    },

    /* Show a formulaire to contact the website admin  */
    contact: function(req, res, next) {
        res.render('contact', {
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    },

    sendContactMail: function(req, res, next) {
        var valid = true;
        var error_list = [];
        //HoneyPot
        if (req.body.company) {
            valid = false;
            error_list.push("Spam bot detected");
            res.render('contact', {
                isAuthenticated: req.isAuthenticated(),
                user: req.user,
                error_list: error_list
            });
            return;
        }

        var name = req.body.name;
        var email = req.body.email;
        var message = req.body.message;

        if (!name || name.length < 3) {
            error_list.push("Enter a name with at least 3 characters.");
            valid = false;
        }

        if (!email || !validator.validate(email)) {
            error_list.push("Enter a valid email.");
            valid = false;
        }

        if (!message || message.length < 15) {
            error_list.push("Your message must contains at least 15 characters.");
            valid = false;
        }

        if (!valid) {
            res.render('contact', {
                isAuthenticated: req.isAuthenticated(),
                user: req.user,
                error_list: error_list,
                name: name,
                email: email,
                message: message
            });
            return;
        }

        var mailOpts, smtpTrans;

        smtpTrans = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: "noreply.streambettv@gmail.com",
                pass: "streamcoin"
            }
        });

        mailOpts = {
            from: name + ' (' + email + ')',
            to: "contact.streambet.tv@gmail.com",
            subject: "Website contact",
            text: message + "\n from : " + name + "\n email : " + email
        };

        smtpTrans.sendMail(mailOpts, function(error, info) {
            if (error) {
                error_list.push("Error, mail not sent");
                res.render('contact', {
                    isAuthenticated: req.isAuthenticated(),
                    user: req.user,
                    error_list: error_list,
                    name: name,
                    email: email,
                    message: message
                });
            } else {
                res.render('contact', {
                    isAuthenticated: req.isAuthenticated(),
                    user: req.user,
                    success: "Your message was sent."
                });
            }
        });

    },

    howtoplay: function(req, res, next) {
        res.render('howtoplay', {
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    },

    /* 404 Page not found  */
    page404: function(req, res, next) {
        //res.status(404);
        res.render('404', {
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    }

};
