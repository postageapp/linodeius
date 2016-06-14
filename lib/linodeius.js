// == Imports ===============================================================

const request = require('request');
const merge = require('merge');

const fs = require('fs');
const path = require('path');

// == Local Constants =======================================================

const apiUrl = 'https://api.linode.com/';

// == Support Functions =====================================================

function makeApiCall(apiKey, action, args) {
  // FIX: Update to allow proxy configuration

  return new Promise(function(resolve, reject) {
    request({
      method: 'POST',
      url: apiUrl,
      qs: {
        api_key: apiKey,
        api_action: action
      }
    }, function(err, response, body) {
      // FIX: Use promisify?
      if (err) {
        return reject(err);
      }

      resolve(body, response);
    });
  });
}

function loadAllMethodsSync(target) {
  var methodsPath = path.resolve(__dirname, '../methods');
  var methodsList = [ ];

  fs.readdirSync(methodsPath).forEach(function(file) {
    if (file.match(/\.json$/)) {
      var methodName = file.replace(/\.json$/, '');
      var parts = methodName.split(/\./);

      method = JSON.parse(fs.readFileSync(path.resolve(methodsPath, file)));

      methodsList.push(method.name.replace(/[\(\)]/g, ''));

      var lastName = parts.pop();
      var dest = target;

      parts.forEach(function(part) {
        if (!dest[part]) {
          dest[part] = { };
        }

        dest = dest[part];
      });

      var methodFn = function() {
        return makeApiCall(target.apiKey, methodName);
      }

      target[methodName] = methodFn;
      dest[lastName] = methodFn;
    }
  });

  target.__api_methods = methodsList;
}

// == Exported Functions ====================================================

function Linode(apiKey) {
  this.apiKey = apiKey;

  loadAllMethodsSync(this);
};

// == Exports ===============================================================

module.exports = Linode;
