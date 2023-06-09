var triggers;
//probaly should have the bot.js create objects for the different modules and set which ones are fun there. would take away some versatility though.
//maybe i'll create a readme for the modules with an object thats properties can set true / false to flag individual commands as fun or not fun
var fun_command = true;
//pass these from bot instead of including them here
var db      = require('../modules/db.js');
var HTTPS   = require('https');
//init - make an init function
db.getApiTriggers(function(res){
  triggers = res;
});

exports.modName = "Api Commands";

exports.checkCommands = function(dataHash, callback) {
  for (trigger in triggers) {
    trigger = triggers[trigger];
    var triggerReg = new RegExp(trigger.regex, "i");
    if (dataHash.request.text && triggerReg.test(dataHash.request.text)){
      var val = triggerReg.exec(dataHash.request.text);
      if (!dataHash.funMode && fun_command){
        callback(true, "Sorry I'm no fun right now.", []);
      } else {
        trigger.val = val[1];
        apiRequest(trigger.apiHost, trigger.apiPath, val[1], trigger.message, trigger.failMessage, function(msg){
          callback(true, msg, []);
        });
      }
      break;
    }
  }
}

exports.setAll = function(triggerHash) {
  triggers = triggerHash;
}

exports.getAll = function() {
  return triggers;
}

exports.getCmdListDescription = function () {
  return null;
}

function apiRequest(host, path, input, returnProperty, failMsg, apiCallback) {
  path = path.replace("$$1", encodeURIComponent(input));

  var options = {
    hostname: host,
    path: path
  };
  props = returnProperty.split('.');

  callback = function(response) {
    str = '';

    response.on('data', function(chunk) {
      str += chunk;
    });

    response.on('end', function() {
      str = JSON.parse(str);
      msg = str;

      for (prop in props) {
        if (typeof(msg[props[prop]]) !== 'undefined') {
          msg = msg[props[prop]];
        } else {
          msg = failMsg;
        }
      }

      apiCallback(msg);
    });
  };

  HTTPS.request(options, callback).end();
}