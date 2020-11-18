'use strict';

const config = require('../config/config');
const {makeUrl} = require('../utils/make-url');
const {isMarkValid} = require('../utils/marks');
const {getTemplate} = require('../utils/get-template');
const {formatDateShort} = require('../utils/format-date');
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
            class: group.class,
            skill_id: skill_id,
        },
        include: Skills,
        order: ["skill_order", "skill_id"]
    })

    if (!ctx.state.skillsets.length) {
        return ctx.render('404', {})
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

                }
            }
        }

        ctx.status = 204;
        return;
    }

    ctx.state.marks = await lesson.getMarks()

    ctx.state.title = lesson.topic || ctx.state.skillsets[0].Skill.name;

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
        {name: group.name, path: makeUrl(['groups', group.id])},
        {name: formatDateShort(new Date(lesson.date)) + ' &ndash; ' + lesson.Subject.name, path: makeUrl(['groups', group.id, 'lessons', lesson.id])},
    ];

    // noinspection NonAsciiCharacters
    ctx.state.absesne_marks_labels = {
        '': 'Присутствует',
        'Н': 'Отсутствует',
        'Д': 'Дистанционно',
    }

    return ctx.render(getTemplate(__filename), {})
};

function getMarkKey(lesson_id, student_id, skill_id) {
    return [lesson_id, student_id, skill_id].join('_');
}
