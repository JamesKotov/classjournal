'use strict';

const {getTemplate} = require('../utils/get-template');
const {Users} = require('../models');

module.exports = async (ctx) => {

    ctx.state.users = await Users.findAll({})

    ctx.state.title = "Пользователи";

    ctx.state.activeMenu = 'users';

    return ctx.render(getTemplate(__filename))
};
