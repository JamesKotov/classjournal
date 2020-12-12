'use strict';

const fs = require('fs');
const path = require('path');


const {Marks, Quarters, Skills, SkillSets, Subjects} = require('../models')
const {getTemplate} = require('../utils/get-template');
const renderPdf = require('../utils/render-pdf')
const {makeUrl} = require('../utils/make-url')
const {getNowTime} = require('../utils/now')
const config = require('../config/config')

const filepath = path.join(__dirname, '../static/bootstrap.css');
const styles = fs.readFileSync(filepath);

const quarterDeclension = {
    1: 'первую',
    2: 'вторую',
    3: 'третью',
    4: 'четвертую',
}

function getQuarterDeclension(quarter_num) {
    return quarterDeclension[quarter_num] || (quarter_num + '')
}

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
        }
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

    if (!lessons.length) {
        return ctx.throw(400)
    }

    let lessonsParts = [];
    const max_skills_per_page = config.max_skills_per_page;
    let count = 0;

    lessons.forEach(l => {
        const used_skills = [...new Set(l.Marks.map(m => m.skill_id))];
        l.used_skills = skillsets.filter(s => used_skills.indexOf(s.skill_id) >= 0);
        count += (l.used_skills.length || 1);
        const i = isPdf ?  Math.ceil(count / max_skills_per_page) - 1 : 0;
        lessonsParts[i] = lessonsParts[i] || [];
        lessonsParts[i].push(l);
    })

    ctx.state.lessonsParts = lessonsParts;


    ctx.state.students = await group.getStudents({
        order: ["surname", "name"]
    });

    ctx.state.title = `${group.name}&nbsp;&ndash; отчет за&nbsp;${getQuarterDeclension(quarter_id)} четверть по&nbsp;предмету &laquo;${subject.name}&raquo;`;

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
        {name: group.name, path: makeUrl(['groups', group.id])},
    ];

    ctx.state.activeMenu = 'groups';

    if (isPdf) {
        const rendered = await ctx.render(getTemplate(__filename), {
            layout: 'pdf',
            styles: styles,
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
