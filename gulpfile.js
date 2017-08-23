// == Imports ===============================================================

const fs = require('fs');
const path = require('path');

const gulp = require('gulp');

// == Constants =============================================================

// == Support Functions =====================================================

// == Exported Class ========================================================

// == Gulp Tasks ============================================================

gulp.task('api.spec', () => {
  const linodeius = require('./lib/linodeius');
  const api = require('./lib/api');

  return api.call(linodeius.apiKey, 'api.spec').then(spec => {
    const specPath = path.resolve(
      __dirname,
      `api.spec/version-${spec.version}.json`
    );

    var specFile = fs.createWriteStream(specPath);

    specFile.write(JSON.stringify(spec, null, 2));
  });  
});

gulp.task('default', [ 'api.spec' ]);
