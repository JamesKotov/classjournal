'use strict';

const urljoin = require('url-join');

const {Marks, SkillSets, Skills, Subjects} = require('../models');
const ABSENCE_SKILL_ID = 1;

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id;
    const lesson_id = ctx.params.lesson_id;

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

    const lessons = await group.getLessons({
        where: {
            'id': lesson_id
        },
        include: Subjects,
    });

    if (!lessons.length) {
        const template = '404';
        return ctx.render(template, {})
    }

    const lesson = lessons[0]

    ctx.state.lesson = lesson
    ctx.state.group = group;
    ctx.state.students = await group.getStudents();
    ctx.state.skillsets = await SkillSets.findAll({
        where: {
            subject_id: lesson.subject_id,
            class: group.class
        },
        include: Skills,
        order: ["skill_id"]
    })

    ctx.state.marks = await lesson.getMarks()

    ctx.state.title = [lesson.Subject.name, lesson.topic].filter(Boolean).join('&nbsp;&ndash; ')

    ctx.state.breadcrumbs = [
        {name: "Группы", path: '/groups'},
        {name: group.name, path: urljoin('/groups', group.id+'')},
    ];

    ctx.state.getMarksForSkill = function(skill_id) {
        const all_marks = Marks.rawAttributes['mark'].values;
        const marks = skill_id === ABSENCE_SKILL_ID ? all_marks.slice(0, 1) : all_marks.slice(1);
        return [''].concat(marks)
    }

    const template = 'lesson';
    return ctx.render(template, {})
};
