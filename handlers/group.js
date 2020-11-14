'use strict';

const {Subjects} = require('../models')

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id;

    const groups = await ctx.state.user.getGroups({
        where: {
            'id': group_id
        }
    });

    if (!groups.length) {
        const template = '404';
        return ctx.render(template, {})
    }

    const group = groups[0]

    ctx.state.group = group;
    ctx.state.lessons = (await group.getLessons({
        include: Subjects,
        order: ["date", "time"]
    })).reduce(function (accumulator, currentLesson) {
        const date = currentLesson.date;
        accumulator[date] = accumulator[date] || [];
        accumulator[date].push(currentLesson);
        return accumulator;
    }, {});

    ctx.state.title = group.name;

    const template = 'group';
    return ctx.render(template, {})
};
