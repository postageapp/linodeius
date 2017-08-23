// == Imports ===============================================================

const request = require('request');
const merge = require('merge');

const fs = require('fs');
const path = require('path');

const _ = require('lodash');

const api = require('./api');

// == Local Constants =======================================================

const apiSpec = require('../api.spec/version-3.3.json');

// == Support Functions =====================================================

function apiKeyFromFile(keyPath) {
  if (typeof(keyPath) != 'string') {
    return;
  }

  try {
    if (fs.statSync(keyPath).isFile()) {
      return fs.readFileSync(keyPath).toString().replace(/\s+/g, '');
    }
  }
  catch (err) {
    switch (err.code) {
      case 'ENOENT':
        // Not found.
        return false;
      default:
        throw err;
    }
  }
}

function apiKeySetting() {
  if (process.env['LINODE_API_KEY']) {
    return process.env['LINODE_API_KEY'];
  }

  var apiKey = apiKeyFromFile(process.env['LINODE_API_KEY_PATH']);

  if (apiKey) {
    return apiKey;
  }

  apiKey = apiKeyFromFile(path.resolve(__dirname, '../.linode-key'));

  if (apiKey) {
    return apiKey;
  }

  apiKey = apiKeyFromFile(path.resolve(process.env.HOME, '.linode-key'));

  if (apiKey) {
    return apiKey;
  }

  return;
}

// == Exported Functions ====================================================

class Linode {
  constructor(options) {
    switch (typeof(options)) {
      case 'string':
        this.apiKey = options;
      default:
        this.apiKey = options && options.apiKey || apiKeySetting();
    }
    
    this.methods = apiSpec.methods;
    this.version = apiSpec.version;

    var apiKey = this.apiKey;

    _.each(this.methods, (method, methodName) => {
      var parts = methodName.split(/\./);
      var lastName = parts.pop();
      var dest = this;

      parts.forEach(part => {
        if (!dest[part]) {
          dest[part] = { };
        }

        dest = dest[part];
      });

      var methodFn = function() {
        return api.call(apiKey, methodName);
      }

      this[methodName] = dest[lastName] = methodFn;
    });
  }
}

// == Exports ===============================================================

module.exports = Linode;
