'use strict';

const {getTemplate} = require('../utils/get-template');
const {makeUrl} = require('../utils/make-url');
const {Subjects} = require('../models')

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id;

    const groups = await ctx.state.user.getGroups({
        where: {
            'id': group_id
        }
    });

    if (!groups.length) {
        return ctx.render('404', {})
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

    ctx.state.students = await group.getStudents({
        order: ["surname", "name"]
    });

    ctx.state.title = group.name;

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
    ];

    ctx.state.activeMenu = 'groups';

    return ctx.render(getTemplate(__filename), {})
};
