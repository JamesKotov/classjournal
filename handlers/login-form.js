'use strict';

const {getTemplate} = require('../utils/get-template');

module.exports = async (ctx) => {
    ctx.state.title = "";
    return ctx.render(getTemplate(__filename))
};
