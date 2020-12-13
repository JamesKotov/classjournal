'use strict';

const config = require('../config/config');
const {getNowTime} = require('../utils/now');
const {makeUrl} = require('../utils/make-url');
const {getTemplate} = require('../utils/get-template');
const {Marks, Quarters, SkillSets, Skills, Students, Subjects} = require('../models');

const all_marks = Marks.rawAttributes['mark'].values;

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id;
    const lesson_id = ctx.params.lesson_id;

    const groups = await ctx.state.user.getGroups({
        where: {
            'id': group_id
        },
        include: [{
            model: Students,
            as: 'Students',
        }],
        order: [
            [Students, 'surname'],
            [Students, 'name'],
        ]
    });

    if (!groups.length) {
        return ctx.throw(404)
    }

    const group = groups[0]
    ctx.state.group = group;

    const lessons = await group.getLessons({
        where: {
            'id': lesson_id
        },
        include: [Subjects, Marks]
    });

    if (!lessons.length) {
        return ctx.throw(404)
    }

    const lesson = lessons[0]
    ctx.state.lesson = lesson

    ctx.state.skillsets = await SkillSets.findAll({
        where: {
            subject_id: lesson.subject_id,
            class: group.class
        },
        include: Skills,
        order: ["skill_order", "skill_id"]
    })

    lesson.initLesson(ctx.state.skillsets, config.absence_skill_id, all_marks)

    ctx.state.quarters = await Quarters.findAll({
        order: ["id"]
    })

    const now = getNowTime();
    const nowTs = now.getTime();
    const current_quarter = ctx.state.quarters.find(q => q.begin.getTime() <= nowTs && q.end.getTime() >= nowTs);

    ctx.state.current_quarter_id = current_quarter ? current_quarter.id : 0;

    ctx.state.title = lesson.Subject.name;

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
        {name: group.name, path: makeUrl(['groups', group.id])},
    ];

    ctx.state.activeMenu = 'groups';

    return ctx.render(getTemplate(__filename))
};
