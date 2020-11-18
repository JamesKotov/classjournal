'use strict';

const {makeUrl} = require('../utils/make-url');
const {getTemplate} = require('../utils/get-template');
const {SkillSets, Skills, Subjects} = require('../models');

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id;
    const lesson_id = ctx.params.lesson_id;

    const groups = await ctx.state.user.getGroups({
        where: {
            'id': group_id
        }
    });

    if (!groups.length) {
        return ctx.render('404', {})
    }

    const group = groups[0]

    const lessons = await group.getLessons({
        where: {
            'id': lesson_id
        },
        include: Subjects,
    });

    if (!lessons.length) {
        return ctx.render('404', {})
    }

    const lesson = lessons[0]

    ctx.state.lesson = lesson
    ctx.state.group = group;
    ctx.state.skillsets = await SkillSets.findAll({
        where: {
            subject_id: lesson.subject_id,
            class: group.class
        },
        include: Skills,
        order: ["skill_order", "skill_id"]
    })

    ctx.state.students = await group.getStudents({
        order: ["surname", "name"]
    });

    ctx.state.marks = await lesson.getMarks()

    const used_skills = [...new Set(ctx.state.marks.map(m => m.skill_id))]
    ctx.state.used_skills = ctx.state.skillsets.filter(s => used_skills.indexOf(s.skill_id) >= 0)

    ctx.state.title = lesson.Subject.name;

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
        {name: group.name, path: makeUrl(['groups', group.id])},
    ];

    return ctx.render(getTemplate(__filename), {})
};
