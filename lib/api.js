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

const errorCode = {
  0: 'ok',
  1: 'Bad request',
  2: 'No action was requested',
  3: 'The requested class does not exist',
  4: 'Authentication failed',
  5: 'Object not found',
  6: 'A required property is missing for this action',
  7: 'Property is invalid',
  8: 'A data validation error has occurred',
  9: 'Method Not Implemented',
  10: 'Too many batched requests',
  11: 'RequestArray isn\'t valid JSON or WDDX',
  12: 'Batch approaching timeout. Stopping here.',
  13: 'Permission denied',
  14: 'API rate limit exceeded',
  30: 'Charging the credit card failed',
  31: 'Credit card is expired',
  40: 'Limit of Linodes added per hour reached',
  41: 'Linode must have no disks before delete'
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
        err.name = 'Linode API';
        err.code = e.errorcode;
        err.desc = errorCode[e.errorcode];
      });

      reject(err);;
    });
  });
}

// == Exports ===============================================================

module.exports = {
  call: call
};
