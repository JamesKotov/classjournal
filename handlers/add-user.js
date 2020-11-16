'use strict';
const crypto = require('crypto');

const config = require('../config/config');
const {Users} = require('../models')


module.exports = async (ctx, next) => {

    ctx.checkBody('name', 'First name can\'t be empty').notEmpty()
    ctx.checkBody('surname', 'Last name can\'t be empty.').notEmpty()
    ctx.checkBody('email', 'The email you entered is invalid, please try again.').isEmail()
    ctx.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100)
    ctx.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100)
    const errors = await ctx.validationErrors()
    if (errors) {
        ctx.body = `There have been validation errors: ${errors}`
    } else {
        ctx.request.body.password = crypto.scryptSync(ctx.request.body.password, config.hashSecret, 64).toString('hex');
        try {
            ctx.body = await Users.create(ctx.request.body)
        } catch (error) {
            ctx.body = error
        }
    }
    await next()
};
