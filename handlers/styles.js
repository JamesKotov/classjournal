'use strict';

const mime = require('mime-types');

const cacheLong = require('../utils/cache-long');

module.exports = async (ctx) => {
    const css = await require('../utils/css');
    cacheLong(ctx, mime.lookup('style.css'));
    ctx.body = css;
};
