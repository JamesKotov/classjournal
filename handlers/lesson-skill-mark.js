'use strict';

const config = require('../config/config');
const {makeUrl} = require('../utils/make-url');
const {isMarkValid} = require('../utils/marks');
const {getTemplate} = require('../utils/get-template');
const {formatDateShort} = require('../utils/format-date');
const {Marks, SkillSets, Skills, Students, Subjects} = require('../models');

const all_marks = Marks.rawAttributes['mark'].values;

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id * 1;
    const lesson_id = ctx.params.lesson_id * 1;
    const skill_id = ctx.params.skill_id * 1;

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
    ctx.state.group = group

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
            class: group.class,
            skill_id: skill_id,
        },
        include: Skills,
        order: ["skill_order", "skill_id"]
    })

    if (!ctx.state.skillsets.length) {
        return ctx.throw(404)
    }

    if (ctx.method === 'POST') {
        const body = ctx.request.body;
        for (let student of group.Students) {
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

    lesson.Marks = await lesson.getMarks()
    lesson.initLesson(ctx.state.skillsets, config.absence_skill_id, all_marks)

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

    ctx.state.activeMenu = 'groups';

    return ctx.render(getTemplate(__filename))
};

function getMarkKey(lesson_id, student_id, skill_id) {
    return [lesson_id, student_id, skill_id].join('_');
}
