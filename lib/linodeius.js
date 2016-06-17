// == Imports ===============================================================

const request = require('request');
const merge = require('merge');

const fs = require('fs');
const path = require('path');

const api = require('./api');

// == Local Constants =======================================================

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

function Linode(options) {
  var self = this;
  
  switch (typeof(options)) {
    case 'string':
      this.apiKey = options;
    default:
      this.apiKey = options && options.apiKey || apiKeySetting();
  }
  
  this.__init = api.call(this.apiKey, 'api.spec').then(function(spec) {
    self.methods = spec.methods;
    self.version = spec.version;

    Object.keys(self.methods).forEach(function(methodName) {
      var method = self.methods[methodName];

      var parts = methodName.split(/\./);
      var lastName = parts.pop();
      var dest = self;

      parts.forEach(function(part) {
        if (!dest[part]) {
          dest[part] = { };
        }

        dest = dest[part];
      });

      var methodFn = function() {
        return api.call(self.apiKey, methodName);
      }

      self[methodName] = methodFn;
      dest[lastName] = methodFn;
    });

    delete self.__init;
  });
};

Linode.prototype.then = function(fn) {
  if (this.__init) {
    return this.__init.then(fn);
  }
  else {
    return fn();
  }
}

Linode.prototype.call = function(name, args) {
  var self = this;

  return this.then(function() {
    return api.call(self.apiKey, name);
  })
}

// == Exports ===============================================================

module.exports = Linode;
