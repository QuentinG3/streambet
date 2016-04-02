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

  //TODO : Check if user connected or not, and provide user info
  /* Show profil section  */
  profil : function(req, res, next) {
    res.render('profil', {});
  }

}
