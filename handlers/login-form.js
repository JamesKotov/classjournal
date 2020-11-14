'use strict';

module.exports = async (ctx) => {
    ctx.state.title = "";
    const template = 'login-form';
    return ctx.render(template, {})
};
