'use strict';


const {getTemplate} = require('../utils/get-template');
const {Groups, Students} = require('../models');
const {makeUrl} = require('../utils/make-url');

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id * 1;
    const student_id = ctx.params.student_id * 1;

    ctx.state.groups = await ctx.state.user.getGroups({order: ["name"]});

    let current_group = group_id ? ctx.state.groups.find(g => g.id === group_id) : undefined;

    if (group_id && !current_group) {
        return ctx.render('404', {})
    }

    ctx.state.group_id = 0

    if (student_id) {
        ctx.state.student = await Students.findOne({
            where: {
                id: student_id,
                '$Groups.user_id$': ctx.state.user.id
            },
            include: [{
                model: Groups,
                as: 'Groups'
            }],
            order: ["surname", "name"]
        })

        if (!ctx.state.student) {
            return ctx.render('404', {})
        }

        ctx.state.group_id = ctx.state.student.Groups[0].id;
    } else {
        ctx.state.student = Students.build({
            class: current_group ? current_group.class : 0,
            include: [Groups]
        });

        if (group_id) {
            ctx.state.group_id = group_id;
        }
    }

    ctx.state.errors = {};

    let url_parts = ['students'];
    let hash = []
    if (current_group) {
        url_parts = ['groups', current_group.id]
        hash = ['students']
    }
    ctx.state.return_url = makeUrl(url_parts, hash);

    if (ctx.method === 'POST') {
        const body = ctx.request.body;

        const surname = (body.surname || '').trim();
        if (!surname) {
            ctx.state.errors.surname = 'Не задана фамилия'
        } else {
            ctx.state.student.surname = surname;
        }

        const name = (body.name || '').trim();
        if (!name) {
            ctx.state.errors.name = 'Не задано имя'
        } else {
            ctx.state.student.name = name;
        }

        const _class = (body.class || -2) * 1
        if (_class < -1 || _class > 9) {
            ctx.state.errors.class = 'Не правильно указан класс'
        } else {
            ctx.state.student.class = _class;
        }

        const request_group_id = (body.group_id || 0) * 1;
        const requested_group = ctx.state.groups.find(g => g.id === request_group_id);
        if (!requested_group) {
            ctx.state.errors.group_id = 'Не правильно указана группа'
        } else {
            ctx.state.student.Groups = [
                requested_group
            ]
        }

        if (!Object.keys(ctx.state.errors).length) {
            await ctx.state.student.save();
            await ctx.state.student.setGroups(requested_group)

            return ctx.redirect(ctx.state.return_url);
        }
    }

    ctx.state.class_labels = {
        '-1': 'Младший подготовительный',
        '0': 'Старший подготовительный',
    }

    ctx.state.title = student_id ? 'Редактировать ученика' : 'Добавить ученика';

    ctx.state.breadcrumbs = current_group ? [
        {name: "Группы", path: makeUrl(['groups'])},
        {name: current_group.name, path: makeUrl(['groups', current_group.id])},
    ] : [
        {name: "Ученики", path: makeUrl(['students'])},
    ];

    ctx.state.activeMenu = current_group ? 'groups' : 'students';

    return ctx.render(getTemplate(__filename), {})
};
