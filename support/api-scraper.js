// == Imports ===============================================================

var url = require('url');

const Readable = require('stream').Readable;
const Transform = require('stream').Transform;

const request = require('request');
const cheerio = require('cheerio');

// == Constants =============================================================

const baseUrl = 'https://www.linode.com/api/';
const groups = [
  'linode',
  'nodebalancer',
  'stackscript',
  'image',
  'dns',
  'account',
  'utility'
];

// == Exported Functions ====================================================

class SourcePages extends Readable {
  constructor() {
    super({
      objectMode: true
    });
  }

  _read(size) {
    var self = this;

    groups.forEach(function(group) {
      self.push(baseUrl + group);
    });

    self.push(null);
  }
}

class ObjectTransform extends Transform {
  constructor() {
    super({
      objectMode: true
    });
  }
}

class DocumentLoader extends ObjectTransform {
  _transform(pageUrl, encoding, callback) {
    var self = this;
    var body = '';
    var statusCode;

    console.log(pageUrl + ' (Fetch)');

    request
      .get(pageUrl)
      .on('response', function(response) {
        statusCode = response.statusCode;
      })
      .on('error', function(err) {
        console.log({err:err})
        callback(err)
      })
      .on('data', function(data) {
        body = body.concat(data.toString());
      })
      .on('end', function() {
        if (statusCode == 200) {
          console.log(pageUrl + ' (Done)');
          self.push(cheerio.load(body));
        }

        callback();
      })
  }
}

class EndpointExtractor extends ObjectTransform {
  _transform(doc, encoding, callback) {
    var self = this;

    doc('.sidebar a').each(function(i, a) {
      var pageUrl = url.resolve(baseUrl, doc(a).attr('href'));
      console.log(pageUrl + ' (Found)')

      self.push(pageUrl);
    });

    callback();
  }
}

// == Module Exports ========================================================

module.exports = {
};

var sp = new SourcePages;
var pl = new DocumentLoader;
var ex = new EndpointExtractor;
var pl2 = new DocumentLoader;

sp
  .pipe(new DocumentLoader)
  .pipe(new EndpointExtractor)
  .pipe(new DocumentLoader)//.pipe(process.stdout);
