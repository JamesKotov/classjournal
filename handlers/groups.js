'use strict';

module.exports = async (ctx) => {

    ctx.state.groups = await ctx.state.user.getGroups({order: ["name"]});

    ctx.state.title = "Группы";

    const template = 'groups';
    return ctx.render(template, {})
};
