'use strict';

const urljoin = require('url-join');


function makeUrl(parts = [], hash_parts = []) {
    if (!(Array.isArray(parts) && parts.length)) {
        return '/';
    }

    let result = urljoin('/', ...parts.map(i => i+'')).replace(/\/\//g, "/");

    if (Array.isArray(hash_parts) && hash_parts.length) {
        result += '#' + hash_parts.join('_');
    }

    return result;
}

module.exports = {makeUrl};
