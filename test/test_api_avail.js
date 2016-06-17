require('./harness');

const Linode = require('../lib/linodeius');

it('should return an API specification', function() {
  var api = new Linode();

  return api.then(function() {
    assert.ok(api.api);
    assert.ok(api.api.spec);

    return api.api.spec().then(function(spec) {
      assert.ok(spec);

      assert.equal(spec.version, '3.3')
    });
  });
});
