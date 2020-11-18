'use strict';

const {getTemplate} = require('../utils/get-template');

module.exports = async (ctx) => {

    ctx.state.groups = await ctx.state.user.getGroups({order: ["name"]});

    ctx.state.title = "Группы";

    return ctx.render(getTemplate(__filename), {})
};
