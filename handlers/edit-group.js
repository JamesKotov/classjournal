'use strict';

const {getTemplate} = require('../utils/get-template');
const {makeUrl} = require('../utils/make-url');
const {Groups} = require('../models')

module.exports = async (ctx) => {

    const group_id = ctx.params.group_id;

    if (group_id) {

        const groups = await ctx.state.user.getGroups({
            where: {
                'id': group_id
            }
        });

        if (!groups.length) {
            return ctx.render('404', {})
        }

        ctx.state.group = groups[0];

    } else {
        ctx.state.group = Groups.build({
            user_id: ctx.state.user.id
        });
    }

    ctx.state.errors = {};

    let url_parts = ['groups'];
    ctx.state.return_url = makeUrl(url_parts);

    if (ctx.method === 'POST') {
        const body = ctx.request.body;

        const name = (body.name || '').trim();
        if (!name) {
            ctx.state.errors.name = 'Не задано название'
        } else {
            ctx.state.group.name = name;
        }

        const _class = (body.class || -2) * 1
        if (_class < -1 || _class > 9) {
            ctx.state.errors.class = 'Не правильно указан класс'
        } else {
            ctx.state.group.class = _class;
        }

        if (!Object.keys(ctx.state.errors).length) {
            await ctx.state.group.save();

            return ctx.redirect(ctx.state.return_url);
        }
    }

    ctx.state.class_labels = {
        '-1': 'Младший подготовительный',
        '0': 'Старший подготовительный',
    }

    ctx.state.title = group_id ? 'Редактировать группу' : 'Добавить группу';

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
    ];

    ctx.state.activeMenu = 'groups';

    return ctx.render(getTemplate(__filename), {})
};
