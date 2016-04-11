
module.exports = {

    voteStreamer : function(req,res){
      //DATA
      var user = req.user;
      var streamer = req.body.streamer;
      var vote = req.body.vote;

      //Check user
      if(user === undefined)
        return res.send(false);

      //Check data
      if(!streamer || streamer === "" || !vote || vote === "")
        return res.send(false);

      //Check Entry exist

      //Check Already vote

      //Create new Entry vote
      return res.send(true);
    },

    voteSummoner : function(req,res){
      //DATA
      var user = req.user;
      var summoner = req.body.summoner;
      var region = req.body.region;
      var vote = req.body.vote;

      //Check user
      if(user === undefined)
        return res.send(false);

      //Check data
      if(!summoner ||summoner === "" || !region || region === "" || !vote || vote === "")
        return res.send(false);

      //Check Entry exist

      //Check Already vote

      //Create new Entry vote
      return res.send(true);
    }

};
