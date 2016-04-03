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
      ]
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
      ]
    });
  },

  /* Show a formulaire to contact the website admin  */
  contact : function(req, res, next) {
    res.render('contact', {});
  },

  /* 404 Page not found  */
  page404 : function(req, res, next) {
    //res.status(404);
    res.render('404', {});
  }

}
