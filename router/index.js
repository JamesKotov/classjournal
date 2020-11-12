const Router = require('koa-router');
const passport = require('koa-passport');

const {authenticated} = require('../utils');

const router = new Router()

router
    .get('/logo.svg', require('../handlers/logo'))
    .get('/favicon.ico', require('../handlers/favicon'))
    .get('/robots.txt', require('../handlers/robots'))
    .get('/styles.css', require('../handlers/styles'))
    .get('/scripts.js', require('../handlers/scripts'))

    .get('/',  (ctx) => {
        if (ctx.isAuthenticated()) {
            ctx.redirect('/groups')
        } else {
            ctx.redirect('/login')
        }
    })

    .get('/login', require('../handlers/login-form'))

    .post('/login', async (ctx) => {
        return passport.authenticate('local', {
            successRedirect: '/groups',
            failureRedirect: '/login'
        })(ctx);
    })

    .get('/logout', authenticated(), (ctx) => {
        ctx.logout()
        return ctx.redirect('/')
    })

    .post('/users/add', require('../handlers/add-user'))

    .get('/groups', authenticated(), require('../handlers/groups'))


module.exports = router
