let Constants = {};

try {
  Constants.API = require('../../config/api_config.development.json');
  Constants.GA = require('../../config/ga_config.json');
}
catch(e) {
  Constants.API = {};
  Constants.GA = {};
}

Constants.KEY_MAP = {
  8: 'DELETE',
  13: 'ENTER',
  32: 'SPACE',
  27: 'ESC',
  37: 'ARROW_LEFT',
  38: 'ARROW_UP',
  39: 'ARROW_RIGHT',
  40: 'ARROW_DOWN'
};

Constants.KODIPORT = "8080";
Constants.KODIIP="192.168.1.7";

// If users forget to change from *.sample.json to *.production.json,
// require will throw out error here, because if we don't have these
// configs here, our program will be broken somehow. In this way, we should
// make sure it does exist before running Kaku.
module.exports = Constants;
