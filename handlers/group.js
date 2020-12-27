'use strict';

const {getTemplate} = require('../utils/get-template');
const {Subjects, Quarters} = require('../models')
const {makeUrl} = require('../utils/make-url')
const {getNowTime} = require('../utils/now')

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id;

    const groups = await ctx.state.user.getGroups({
        where: {
            'id': group_id
        }
    });

    if (!groups.length) {
        return ctx.throw(404)
    }

    const group = groups[0]
    ctx.state.group = group;

    const allLessons = await group.getLessons({
        include: Subjects,
        order: ["date", "time"]
    })

    const subjs = {};
    ctx.state.subjects = [];
    allLessons.forEach(l => { subjs[l.Subject.id] = l.Subject.name});
    Object.keys(subjs).forEach(k => {
        ctx.state.subjects.push({
            id: k,
            name: subjs[k]
        })
    })

    ctx.state.lessons = allLessons.reduce(function (accumulator, currentLesson) {
        const date = currentLesson.date;
        accumulator[date] = accumulator[date] || [];
        accumulator[date].push(currentLesson);
        return accumulator;
    }, {});

    ctx.state.students = await group.getStudents({
        order: ["surname", "name"]
    });

    ctx.state.quarters = await Quarters.findAll({
        order: ["id"]
    })

    const now = getNowTime();
    const nowTs = now.getTime();
    const current_quarter = ctx.state.quarters.find(q => q.begin.getTime() <= nowTs && q.end.getTime() >= nowTs);

    ctx.state.current_quarter_id = current_quarter ? current_quarter.id : 0;

    ctx.state.active_quarters = ctx.state.quarters.filter(q => q.begin.getTime() <= nowTs).map(q => q.id);

    ctx.state.title = group.name;

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
    ];

    ctx.state.activeMenu = 'groups';

    return ctx.render(getTemplate(__filename))
};
