'use strict';

const urljoin = require('url-join');
const sequelize = require("sequelize");

const config = require('../config/config');
const {isMarkValid} = require('../utils/marks');
const {Marks, SkillSets, Skills, Subjects} = require('../models');

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id * 1;
    const lesson_id = ctx.params.lesson_id * 1;
    const skill_id = ctx.params.skill_id * 1;

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
            class: group.class,
            skill_id: skill_id,
        },
        include: Skills,
        order: ["skill_order", "skill_id"]
    })

    if (!ctx.state.skillsets.length) {
        const template = '404';
        return ctx.render(template, {})
    }

    ctx.state.students = await group.getStudents({
        order: ["surname", "name"]
    });

    if (ctx.method === 'POST') {
        const body = ctx.request.body;
        for (let student of ctx.state.students) {
            let key = getMarkKey(lesson.id, student.id, skill_id);
            if (body.hasOwnProperty(key)) {
                let value = decodeURIComponent(body[key]);
                if (!isMarkValid(value, skill_id, config.absence_skill_id)) {
                    ctx.status = 400;
                    return;
                }

                if (!value) {
                    await Marks.destroy({
                        where: {
                            lesson_id: lesson.id,
                            student_id: student.id,
                            skill_id: skill_id
                        }
                    });
                } else {
                    await Marks.upsert({
                        lesson_id: lesson.id,
                        student_id: student.id,
                        skill_id: skill_id,
                        mark: value,
                    }, ['mark']);

                    if (skill_id === config.absence_skill_id) {
                        await Marks.destroy({
                            where: {
                                lesson_id: lesson.id,
                                student_id: student.id,
                                skill_id: {[sequelize.Op.not]: skill_id}
                            }
                        });
                    }
                }
            }
        }

        ctx.status = 204;
        return;
    }

    ctx.state.marks = await lesson.getMarks()

    ctx.state.title = ctx.state.skillsets[0].Skill.name;

    const lesson_title = [lesson.Subject.name, lesson.topic].filter(Boolean).join('&nbsp;&ndash; ')

    ctx.state.breadcrumbs = [
        {name: "Группы", path: '/groups'},
        {name: group.name, path: urljoin('/groups', group.id + '')},
        {name: lesson_title, path: urljoin('/groups', group.id + '', '/lessons', lesson.id + '')},
    ];

    const template = 'lesson-skill-mark';
    return ctx.render(template, {})
};

function getMarkKey(lesson_id, student_id, skill_id) {
    return [lesson_id, student_id, skill_id].join('_');
}