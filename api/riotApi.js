var LolApi = require('leagueapi');
LolApi.init("0f161ba9-ce84-42ab-b53d-2dbe14dd2f83");


function initRiotApi() {
  LolApi.init("0f161ba9-ce84-42ab-b53d-2dbe14dd2f83");
  LolApi.setRateLimit(10,500);
}
function getRiotApi(){
  return LolApi;
}

module.exports = {
  initRiotApi : initRiotApi,
  getRiotApi : getRiotApi
};
