'use strict';

const {getTemplate} = require('../utils/get-template');

module.exports = async (ctx) => {

    ctx.state.groups = await ctx.state.user.getGroups({order: ["class", "name"]});

    ctx.state.title = "Группы";

    ctx.state.activeMenu = 'groups';

    return ctx.render(getTemplate(__filename), {})
};
