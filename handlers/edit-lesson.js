'use strict';

const {getTemplate} = require('../utils/get-template');
const {Quarters, Subjects, Lessons} = require('../models');
const {getNowTime} = require('../utils/now');
const {makeUrl} = require('../utils/make-url');

module.exports = async (ctx) => {
    const group_id = ctx.params.group_id;
    const lesson_id = ctx.params.lesson_id;

    const now = getNowTime();

    const groups = await ctx.state.user.getGroups({
        where: {
            'id': group_id
        }
    });

    if (!groups.length) {
        return ctx.throw(404)
    }

    const group = groups[0]

    ctx.state.quarters = await Quarters.findAll({
        order: ["id"]
    })

    if (lesson_id) {
        const lessons = await group.getLessons({
            where: {
                'id': lesson_id
            },
            include: Subjects,
        });

        if (!lessons.length) {
            return ctx.throw(404)
        }

        ctx.state.lesson = lessons[0];
        ctx.state.lesson.datetime = now.toISOString().slice(0, -1);

        if (ctx.state.lesson.date) {
            const date = new Date(ctx.state.lesson.date)
            if (ctx.state.lesson.time) {
                const timeparts = ctx.state.lesson.time.split(':')
                date.setUTCHours(timeparts[0]);
                date.setUTCMinutes(timeparts[1]);
            }
            ctx.state.lesson.datetime = date.toISOString().slice(0, -1);
        }

    } else {
        const nowTs = now.getTime();
        const current_quarter = ctx.state.quarters.find(q => q.begin.getTime() <= nowTs && q.end.getTime() >= nowTs);

        ctx.state.lesson = Lessons.build();
        ctx.state.lesson.group_id = group.id;
        ctx.state.lesson.quarter_id = current_quarter ? current_quarter.id : 0;
        ctx.state.lesson.datetime = now.toISOString().slice(0, -1);
    }

    ctx.state.subjects = await Subjects.findAll({
        order: ["name"]
    });

    ctx.state.errors = {};

    let url_parts = ['groups', group.id];
    if (lesson_id) {
        url_parts = url_parts.concat(['lessons', lesson_id])
    }
    ctx.state.return_url = makeUrl(url_parts);

    if (ctx.method === 'POST') {
        const body = ctx.request.body;

        const quarter_id = (body.quarter_id || 0) * 1;
        const selected_quarter = ctx.state.quarters.find(q => q.id === quarter_id);
        if (!selected_quarter) {
            ctx.state.errors.quarter_id = 'Не правильно выбран квартал'
        } else {
            ctx.state.lesson.quarter_id = quarter_id;
        }

        const subject_id = (body.subject_id || 0) * 1;
        if (!ctx.state.subjects.find(s => s.id === subject_id)) {
            ctx.state.errors.subject_id = 'Не правильно выбран предмет'
        } else {
            ctx.state.lesson.subject_id = subject_id;
        }

        const datetime = body.datetime || ''
        if (!datetime) {
            ctx.state.errors.datetime = 'Не задана дата и время'
        } else {
            try {
                const dt = new Date(datetime+'Z');
                if (selected_quarter) {
                    if (selected_quarter.begin.getTime() > dt.getTime() || selected_quarter.end.getTime() < dt.getTime()) {
                        ctx.state.errors.datetime = 'Выбранная дата не входит в выбранную четверть';
                    } else {
                        ctx.state.lesson.date = new Date(datetime.split('T')[0]);
                        ctx.state.lesson.time = dt.getUTCHours() + ':' + dt.getUTCMinutes()
                    }
                }
            } catch (e) {
                ctx.state.errors.datetime = 'Не корректная дата или время'
            }
        }

        ctx.state.lesson.is_distant = !!body.is_distant;
        ctx.state.lesson.is_control = !!body.is_control;


        ctx.state.lesson.topic = (body.topic || '').trim();
        ctx.state.lesson.task = (body.task || '').trim();


        if (!Object.keys(ctx.state.errors).length) {
            await ctx.state.lesson.save();

            return ctx.redirect(ctx.state.return_url);
        }
    }

    ctx.state.title = lesson_id ? "Редактировать урок" : "Добавить урок";

    ctx.state.breadcrumbs = [
        {name: "Группы", path: makeUrl(['groups'])},
        {name: group.name, path: makeUrl(['groups', group.id])},
    ];

    ctx.state.activeMenu = 'groups';

    return ctx.render(getTemplate(__filename))
};
