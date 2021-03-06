'use strict';

const {Marks, Quarters, Skills, SkillSets, Students, Subjects} = require('../models')
const {getTemplate} = require('../utils/get-template');
const renderPdf = require('../utils/render-pdf')
const {makeUrl} = require('../utils/make-url')
const {getNowTime} = require('../utils/now')
const config = require('../config/config')

const all_marks = Marks.rawAttributes['mark'].values;

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id;
    const quarter_id = ctx.params.quarter_id;
    const subject_id = ctx.params.subject_id;
    const file_format = ctx.params.file_format || '';

    let isPdf = false;
    if (file_format) {
        if (file_format !== 'pdf') {
            return ctx.throw(400)
        }
        isPdf = true;
    }

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

    const quarters = await Quarters.findAll({
        where: {
            'id': quarter_id
        }
    })
    if (!quarters.length) {
        return ctx.throw(404)
    }
    const quarter = quarters[0]
    ctx.state.quarter = quarter

    const now = getNowTime();
    const nowTs = now.getTime();
    if (quarter.begin.getTime() > nowTs) {
        return ctx.throw(400)
    }

    const subjects = await Subjects.findAll({
        where: {
            'id': subject_id,
        },
    })
    if (!subjects.length) {
        return ctx.throw(404)
    }
    const subject = subjects[0]
    ctx.state.subject = subject

    const skillsets = await SkillSets.findAll({
        where: {
            subject_id: subject_id,
            class: group.class
        },
        include: Skills,
        order: ["skill_order", "skill_id"]
    })

    const lessons = await group.getLessons({
        where: {
            'quarter_id': quarter_id,
            'subject_id': subject_id,
        },
        include: Marks,
        order: ["date", "time"]
    })

    let lessonsParts = [];
    const pdf_max_skills_per_page = config.pdf_max_skills_per_page;
    let count = 0;
    let i = 0;

    lessons.forEach(l => {
        l.initLesson(skillsets, config.absence_skill_id, all_marks)
        const skills_count = (l.used_skills.length || 1)
        count += skills_count
        if (count > pdf_max_skills_per_page) {
            count = skills_count;
            i++;
        }
        const part = isPdf ? i : 0;
        lessonsParts[part] = lessonsParts[part] || [];
        lessonsParts[part].push(l);
    })

    ctx.state.lessonsParts = lessonsParts;

    ctx.state.title = `${group.name}&nbsp;&ndash; журнал за&nbsp;${quarter_id} четверть по&nbsp;предмету &laquo;${subject.name}&raquo;`;

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
        {name: group.name, path: makeUrl(['groups', group.id])},
    ];

    ctx.state.activeMenu = 'groups';

    if (isPdf) {
        const rendered = await ctx.render(getTemplate(__filename), {
            layout: 'pdf',
            orientation: config.pdf_orientation,
            width: config.pdf_width,
            cell_width: config.pdf_cell_width,
            styles: await require('../utils/css'),
            styles_zoom: config.pdf_zoom_factor,
            writeResp: false,
        })

        const buffer = await renderPdf(rendered);

        const fname = `${subject.name} - ${quarter_id} четверть - ${group.name}.pdf`;

        ctx.body = buffer;
        ctx.attachment(fname);
        return;
    }

    return ctx.render(getTemplate(__filename))
};
