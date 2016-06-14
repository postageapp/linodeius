// == Imports ===============================================================

var Promise = require('bluebird').Promise;
var fs = require('fs');
var path = require('path');

var readdir = Promise.promisify(fs.readdir);
var unlink = Promise.promisify(fs.unlink);

// == Exported Functions ====================================================

function entries() {
  return readdir(
    __dirname
  ).then(function(files) {
    var expanded = [ ];

    files.forEach(function(file) {
      if (file.match(/\.json$/)) {
        expanded.push(path.resolve(__dirname, file));
      }
    });

    return expanded;
  });
}

function clean() {
  return entries()
    .then(function(files) {
      var remove = [ ];

      files.forEach(function(file) {
        remove.push(unlink(file));
      })

      return Promise.all(remove);
    });
}

function save(name, data) {
  return new Promise(function(resolve, reject) {
    var saveAs = path.resolve(__dirname, name.replace(/[\(\)]/g, '') + '.json');
    
    var file = fs.createWriteStream(saveAs);

    file.write(JSON.stringify(data, null, 2));
    file.end(resolve);
  });
}

// == Exports ===============================================================

module.exports = {
  entries: entries,
  clean: clean,
  save: save
}
