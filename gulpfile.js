var gulp = require('gulp');

gulp.task('methods', function() {
  var api_scraper = require('./support/api-scraper');

  api_scraper.scrape();
});
