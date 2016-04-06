var validator = require("email-validator");
var nodemailer = require("nodemailer");

module.exports = {

  //TODO : Have a real home page
  /* Redirect to the stream wall page. */
  home : function(req, res, next) {
    res.redirect('/streamers');
  },

  //TODO : Get this text from the database ? from text file?
  /* Get the text about the website from a file and show it in the about section. */
  about : function(req, res, next) {
    res.render('about', {
      about: [
        'Explaining what streambet is',
        'Explaining what streambet could be',
        'Explain who we are and why we developped streambet'
      ],
      isAuthenticated: req.isAuthenticated(),
      user: req.user
    });
  },

  //TODO : Get this text from database ? from text file ?
  /* Get the question and answer from a file and show it in the faq section. */
  faq : function(req, res, next) {
    res.render('faq', {
      faq: [
        {id:1, title: "What is streambet ?", text: "response 1"},
        {id:2, title: "Will i be able to bet real money ?", text: "response 2"},
        {id:3, title: "How does the bet works ?", text: "response 3"}
      ],
      isAuthenticated: req.isAuthenticated(),
      user: req.user
    });
  },

  /* Show a formulaire to contact the website admin  */
  contact : function(req, res, next) {
    res.render('contact', {isAuthenticated: req.isAuthenticated(),user: req.user});
  },

  sendContactMail : function(req, res, next) {
    var valid = true;
    var error_list = [];
    //HoneyPot
    if(req.body.company){
      valid = false;
      error_list.push("Spam bot detected");
      res.render('contact',{isAuthenticated: req.isAuthenticated(),user: req.user,error_list: error_list})
      return;
    }

    var name = req.body.name;
    var email = req.body.email;
    var message = req.body.message;

    if(!name || name.length < 3){
      error_list.push("Enter a name with at least 3 characters.")
      valid = false;
    }

    if(!email || !validator.validate(email)){
      error_list.push("Enter a valid email.")
      valid = false;
    }

    if(!message || message.length < 15){
      error_list.push("Your message must contains at least 15 characters.")
      valid = false;
    }

    if(!valid){
      res.render('contact',{
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
      service : 'Gmail',
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

    smtpTrans.sendMail(mailOpts, function(error, info){
      if(error){
        error_list.push("Error, mail not sent");
        res.render('contact',{
          isAuthenticated: req.isAuthenticated(),
          user: req.user,
          error_list: error_list,
          name: name,
          email: email,
          message: message
        });
      }else{
        res.render('contact',{
          isAuthenticated: req.isAuthenticated(),
          user: req.user,
          success: "Your message was sent."
        });
      }
    });

  },

  /* 404 Page not found  */
  page404 : function(req, res, next) {
    //res.status(404);
    res.render('404', {isAuthenticated: req.isAuthenticated(),user: req.user});
  }

}
