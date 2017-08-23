require('./harness');

describe('linode', function() {
  var api = new Linode();

  describe('linode.boot', function() {
    it('should require LinodeID parameter', function() {
      return api.linode.boot().then(function() {
        assert.fail('No errors reported even with required parameter.');
      }).catch(function(err) {
        assert.ok(err);
        assert.equal(err.message, 'LINODEID is required but was not passed in');
        assert.equal(err.code, 6);
      })
    });
  });
});
