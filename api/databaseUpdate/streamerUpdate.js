var Q = require("q");

var database = require('../../database/connection');

//debugs
var UpdateStreamerDebug = require('debug')('updateStreamer');

var updateStreamer = function(streamData, channelName, callbackChannelName) {
  if (!streamData) {
    UpdateStreamerDebug("No data in streamData "+channelName);
    return callbackChannelName();
  }
  if (!streamData.stream) {
    database.streamer.setStreamerOffLine(channelName)
      .then(function() {
        UpdateStreamerDebug("Streamer not online " + channelName);
        return callbackChannelName();
      })
      .catch(function(err) {
        UpdateStreamerDebug(err);
        return callbackChannelName();
      });
  } else if (streamData.stream.game != "League of Legends") {
    database.streamer.setStreamerOffLine(channelName)
      .then(function() {
        UpdateStreamerDebug("Streamer not playing League of legends " + channelName);
        return callbackChannelName();
      })
      .catch(function(err) {
        UpdateStreamerDebug(err);
        return callbackChannelName();
      });
  } else {
    database.streamer.setStreamerOnLine(channelName, streamData.stream.viewers)
      .then(function() {
        UpdateStreamerDebug("Streamer online " + channelName);
        return callbackChannelName();
      })
      .catch(function(err) {
        UpdateStreamerDebug(err);
        return callbackChannelName();
      });
  }
};

module.exports = {
  updateStreamer: updateStreamer
};
