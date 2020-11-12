'use strict';

const fs = require('fs');
const Koa = require('koa')
const path = require('path')
const zlib = require('zlib')
const render = require('koa-ejs')
const session = require('koa-session')
const compress = require('koa-compress')
const passport = require('koa-passport')
const minifier = require('koa-html-minifier')
const bodyParser = require('koa-bodyparser')
const {KoaReqLogger} = require('koa-req-logger')
const cacheControl = require('koa-cache-control')
const koaValidator = require('koa-async-validator')


require('./utils/auth')
const db = require('./models')
const router = require('./router')
const logger = require('./utils/logger');
const config = require('./config/config');
const menu = require('./menu/menu.json')


logger.info('~~~ Starting ClassJournal APP ~~~');


const koaLogger = new KoaReqLogger({
    pinoInstance: logger,
    alwaysError: true // treat all non-2** http codes as error records in logs
});

const viewsDir = path.join(__dirname, 'views');
const modifiedTimes = []
fs.readdirSync(viewsDir).forEach(file => {
    const stats = fs.statSync(path.join(viewsDir, file));
    modifiedTimes.push(stats.mtime.getTime())
});

const lastModified = {
    'styles': Math.max(...modifiedTimes),
}

const staticDir = path.join(__dirname, './static');
fs.readdirSync(staticDir).forEach(file => {
    const stats = fs.statSync(path.join(staticDir, file));
    lastModified[path.parse(file).name] = stats.mtime.getTime();
});

const app = new Koa()

app.keys = [config.hashSecret]

render(app, {
    root: viewsDir,
    layout: 'layout',
    viewExt: 'ejs',
    cache: true,
    debug: false,
    async: true,
});

app
    .use(koaLogger.getMiddleware())
    .use(compress({
        threshold: 2048,
        gzip: {
            flush: zlib.constants.Z_SYNC_FLUSH
        },
        deflate: {
            flush: zlib.constants.Z_SYNC_FLUSH,
        },
        br: {
            flush: zlib.constants.Z_SYNC_FLUSH,
        }
    }))
    .use(minifier({
        collapseWhitespace: true,
        preserveLineBreaks: false,
        useShortDoctype: true,
        decodeEntities: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
    }))
    .use(cacheControl({
        noCache: true
    }))
    .use(async (ctx, next) => {
        try {
            ctx.state.officialSite = '/';
            ctx.state.title = 'Журнал';
            ctx.state.activeMenu = '';
            /*ctx.state.declension = declension;
            ctx.state.formatDate = formatDate;
            ctx.state.formatDateTime = formatDateTime;
            ctx.state.formatMoney = formatMoney;
            ctx.state.genderify = genderify;*/
            ctx.state.lastModified = lastModified;

            await next()
        } catch (err) {
            ctx.status = err.status || 500;
            ctx.log.error(err)
            return ctx.render(ctx.status);
        }
    })
    .use(session({}, app))
    .use(bodyParser())
    .use(koaValidator())
    .use(passport.initialize())
    .use(passport.session())
    .use(async (ctx, next) => {
        ctx.state.isAuthenticated = ctx.isAuthenticated();
        ctx.state.menu = ctx.isAuthenticated() ? menu : {};
        return next();
    })
    .use(router.routes())
    .use(router.allowedMethods())

db.sequelize.sync().then(() => {
    const port = config.serverPort;
    return app.listen(port, '0.0.0.0', () => {
        logger.info(`Server listening on port: ${port}`);
    });
})
