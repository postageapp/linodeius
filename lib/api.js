// == Imports ===============================================================

const _ = require('underscore');
const merge = require('merge');
const Promise = require('bluebird').Promise;
const request = require('request');

// == Constants =============================================================

const apiUrl = 'https://api.linode.com/';

const skipDowncase = {
  PARAMETERS: true
};

// == Exported Functions ====================================================

function downcaseKeys(obj, parents) {
  switch (typeof(obj)) {
    case 'object':
      if (typeof(parents) == 'undefined') {
        parents = [ ];
      }

      var downcased = { };

      Object.keys(obj).forEach(function(key) {
        if (skipDowncase[parents[0]]) {
          downcased[key] = downcaseKeys(obj[key], [ key ].concat(parents));
        }
        else {        
          downcased[key.toLowerCase()] = downcaseKeys(obj[key], [ key ].concat(parents));
        }
      });

      return downcased;
    default:
      return obj;
  }
}

function parse(body) {
  return downcaseKeys(JSON.parse(body));
}

function call(apiKey, action, args) {
  // FIX: Update to allow proxy configuration

  return new Promise(function(resolve, reject) {
    var qs = merge({
      api_key: apiKey,
      api_action: action
    }, args);

    request({
      method: 'POST',
      url: apiUrl,
      qs: qs
    }, function(err, response, body) {
      if (err) {
        return reject(err);
      }

      var parsed = parse(body);

      if (_.isEmpty(parsed.errorarray)) {
        return resolve(parsed.data, response);
      }

      var err;

      _.values(parsed.errorarray).forEach(function(e) {
        err = new Error(e.errormessage);
        err.code = 'LINODE' + e.errorcode;
      });

      reject(err);;
    });
  });
}

// == Exports ===============================================================

module.exports = {
  call: call
};
