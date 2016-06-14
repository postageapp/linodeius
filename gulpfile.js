var gulp = require('gulp');

var Writable = require('stream').Writable;

var methods = require('./methods');

gulp.task('clean', function() {
  methods.clean();
})

gulp.task('update', function() {
  var api_scraper = require('./support/api-scraper');

  api_scraper().pipe(new Writable({
    objectMode: true,
    write: function(obj, encoding, callback) {
      console.log(obj.name);

      methods.save(obj.name, obj).asCallback(callback);
    }
  }));
});

gulp.task('default', [ 'clean', 'update' ]);
