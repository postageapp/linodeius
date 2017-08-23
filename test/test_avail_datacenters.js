require('./harness');

describe('avail', function() {
  var api = new Linode();

  describe('avail.datacenters', function() {
    it('should return a list of available datacenters', function() {
      assert.ok(api.avail);
      assert.ok(api.avail.datacenters);

      return api.avail.datacenters().then(function(datacenters) {
        assert.ok(datacenters);

        assert.equal(datacenters[0].abbr, 'dallas');
      });
    });
  });
});

