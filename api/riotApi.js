var LolApi = require('leagueapi');


function initRiotApi() {
  //Quentin
  //LolApi.init("0f161ba9-ce84-42ab-b53d-2dbe14dd2f83");
  //Nicolas
  LolApi.init("3237f591-a76d-4643-a49e-bc08be9a638b");
  LolApi.setRateLimit(10,500);
}
function getRiotApi(){
  return LolApi;
}

module.exports = {
  initRiotApi : initRiotApi,
  getRiotApi : getRiotApi
};
