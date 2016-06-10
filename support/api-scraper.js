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

    request
      .get(pageUrl)
      .on('response', function(response) {
        statusCode = response.statusCode;
      })
      .on('error', function(err) {
        callback(err)
      })
      .on('data', function(data) {
        body = body.concat(data.toString());
      })
      .on('end', function() {
        if (statusCode == 200) {
          self.push({
            url: pageUrl,
            doc: cheerio.load(body)
          });
        }

        callback();
      })
  }
}

class EndpointExtractor extends ObjectTransform {
  _transform(item, encoding, callback) {
    var self = this;

    item.doc('.sidebar a').each(function(i, a) {
      var pageUrl = url.resolve(baseUrl, item.doc(a).attr('href'));

      self.push(pageUrl);
    });

    callback();
  }
}

class DocumentationExtractor extends ObjectTransform {
  _transform(item, encoding, callback) {
    var self = this;

    var endpoint = {
      name: item.doc('h1.h2').html(),
      params: { }
    };

    item.doc('.api-params li').each(function(i, li) {
      var desc = item.doc(li).text();

      var match = desc.match(/^(\S+)\s*\-\s*(\S+)\s*\((\S+)\)\s+(.*)/);

      if (match) {
        endpoint.params[match[1]] = {
          type: match[2],
          required: match[3] == 'required',
          description: match[4]
        }
      }
    });

    self.push(endpoint);

    callback();
  }
}

// == Module Exports ========================================================

module.exports = function() {
  var sp = new SourcePages;

  return sp
    .pipe(new DocumentLoader)
    .pipe(new EndpointExtractor)
    .pipe(new DocumentLoader)
    .pipe(new DocumentationExtractor);
};
