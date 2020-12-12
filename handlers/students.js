'use strict';


const {getTemplate} = require('../utils/get-template');
const {Groups, Students} = require('../models');

module.exports = async (ctx) => {

    ctx.state.students = await Students.findAll({
        where: {
            '$Groups.user_id$': ctx.state.user.id
        },
        include: [{
            model: Groups,
            as: 'Groups'
        }],
        order: ["surname", "name"]
    })

    ctx.state.title = "Ученики";

    ctx.state.activeMenu = 'students';

    return ctx.render(getTemplate(__filename))
};
