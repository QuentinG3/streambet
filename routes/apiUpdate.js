var http = require('http');
module.exports = {
  updateStramers: function(){
    http.get("https://api.twitch.tv/kraken/streams/{0}", function(res) {
    console.log(res);
});
  }
};
