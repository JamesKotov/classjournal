'use strict';
const crypto = require('crypto')
const IsEmail = require('isemail')

const {getTemplate} = require('../utils/get-template')
const {makeUrl} = require('../utils/make-url')
const config = require('../config/config')
const {Users} = require('../models')


module.exports = async (ctx) => {

    ctx.state.errors = {};
    ctx.state.new_user = {};

    if (ctx.method === 'POST') {

        if (!ctx.request.body.name) {
            ctx.state.errors.name = 'Не задано имя'
        } else {
            ctx.state.new_user.name = ctx.request.body.name
        }

        if (!ctx.request.body.surname) {
            ctx.state.errors.surname = 'Не задана фамилия'
        } else {
            ctx.state.new_user.surname = ctx.request.body.surname
        }

        if (ctx.request.body.patronimic) {
            ctx.state.new_user.patronimic = ctx.request.body.patronimic
        }

        if (!(ctx.request.body.gender === 'male' || ctx.request.body.gender === 'female')) {
            ctx.state.errors.gender = 'Не задан пол'
        } else {
            ctx.state.new_user.gender = ctx.request.body.gender
        }

        if (!IsEmail.validate(ctx.request.body.email)) {
            ctx.state.errors.email = 'Не задана электронная почта'
        } else {
            ctx.state.new_user.email = ctx.request.body.email
        }

        const password = ctx.request.body.password || ''
        if (password.length < 8) {
            ctx.state.errors.password = 'Пароль слишком короткий'
        } else {

            if (password !== ctx.request.body.password2) {
                ctx.state.errors.password2 = 'Пароли не совпадают'
            } else {
                ctx.state.new_user.password = crypto.scryptSync(password, config.hashSecret, 64).toString('hex')
            }
        }

        if (!Object.keys(ctx.state.errors).length) {
            try {
                ctx.state.new_user.role = 'teacher';
                await Users.create(ctx.state.new_user)

                return ctx.redirect('/users');
            } catch (error) {
                ctx.log.error(error, 'failed to add user')
                ctx.state.errors.fail = error
            }
        }
    }

    ctx.state.activeMenu = 'users';

    ctx.state.title = 'Добавление пользователя';

    ctx.state.breadcrumbs = [
        {name: "Пользователи", path: makeUrl(['users'])},
    ];

    return ctx.render(getTemplate(__filename));
};
