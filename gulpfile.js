var gulp = require('gulp');

var Writable = require('stream').Writable;

gulp.task('methods', function() {
  var api_scraper = require('./support/api-scraper');

  api_scraper().pipe(new Writable({
    objectMode: true,
    write: function(obj, encoding, callback) {
      console.log(obj);
      callback();
    }
  }));
});
