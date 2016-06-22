# Linodeius

This is a promise-based [Node.js](https://nodejs.org/en/) client for the
[Linode API](https://www.linode.com/api).

**NOTE:** This is a work in progress. The interface is subject to change.

## Installation

As with any NPM package:

    npm install linodeius

For use in an application:

    const Linode = require('linodeius');
    const api = new Linode(api_key);

    api.then(function() {
      api.linode.list().then(function(linodes) {
        // Use linodes data.
      });
    });

## Configuration

The API key can be specified in a number of locations:

 * The `api_key` argument to `new Linode()`.
 * The `LINODE_API_KEY` environment variable which specifies the key.
 * The `LINODE_API_KEY_FILE` environment variable which specifies a path to
   a file containing the key.
 * A `.linode-key` file in the same directory as this package.
 * A `.linode-key` file in the user's home directory.

The key used to make an API call is dependent on those factors evaluated in
that order of priority.

## TODO

* Add support for batch operations via the `api_action=batch` mode.

## License and Copyright

Copyright (C) 2016 Scott Tadman <tadman@postageapp.com>,
[PostageApp](http://postageapp.com/).

Licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
