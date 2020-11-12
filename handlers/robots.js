'use strict';

const mime = require('mime-types')

const cacheLong = require('../utils/cache-long');

module.exports = async (ctx) => {
    cacheLong(ctx, mime.lookup('robots.txt'));
    ctx.body = 'User-agent: *\nDisallow: /';
};
