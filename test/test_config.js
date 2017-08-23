require('./harness');

describe('Linode', () => {
  var api = new Linode();

  it('has a valid API key', () => {
    assert.ok(api.apiKey);
    assert.equal(api.apiKey.length, 64);
  });
});
