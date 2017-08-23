require('./harness');

describe('api', function() {
  var api = new Linode();

  describe('api.spec', function() {
    it('should return an API specification', function() {
      assert.ok(api.api);
      assert.ok(api.api.spec);

      return api.api.spec().then(function(spec) {
        assert.ok(spec);

        assert.equal(spec.version, '3.3');
      });
    });
  });
});
