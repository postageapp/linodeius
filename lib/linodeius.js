// == Imports ===============================================================

var request = require('request');

var fs = require('fs');
var path = require('path');

// == Support Functions =====================================================

function loadAllMethodsSync(target) {
  var methodsPath = path.resolve(__dirname, '../methods');
  var methodsList = [ ];

  fs.readdirSync(methodsPath).forEach(function(file) {
    if (file.match(/\.json$/)) {
      var parts = file.replace(/\.json$/, '').split(/\./);

      method = JSON.parse(fs.readFileSync(path.resolve(methodsPath, file)));

      methodsList.push(method.name.replace(/[\(\)]/g, ''));
    }
  });

  target.__api_methods = methodsList;
}

// == Exported Functions ====================================================

function Linode(api_key) {
  this.api_key = api_key;
}

Linode.methods = function() {
  if (!Linode.__api_methods) {
    loadAllMethodsSync(Linode);
  }

  return Linode.__api_methods;
}

// == Exports ===============================================================

module.exports = Linode;
