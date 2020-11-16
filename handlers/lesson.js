'use strict';

const urljoin = require('url-join');

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

    ctx.state.title = [lesson.Subject.name, lesson.topic].filter(Boolean).join('&nbsp;&ndash; ')

    ctx.state.breadcrumbs = [
        {name: "Группы", path: '/groups'},
        {name: group.name, path: urljoin('/groups', group.id+'')},
    ];

    const template = 'lesson';
    return ctx.render(template, {})
};