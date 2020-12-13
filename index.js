'use strict';

const fs = require('fs');
const Koa = require('koa')
const path = require('path')
const zlib = require('zlib')
const crypto = require('crypto')
const render = require('koa-ejs')
const session = require('koa-session')
const compress = require('koa-compress')
const passport = require('koa-passport')
const hyphenopoly = require("hyphenopoly")
const minifier = require('koa-html-minifier')
const bodyParser = require('koa-bodyparser')
const {KoaReqLogger} = require('koa-req-logger')
const cacheControl = require('koa-cache-control')
const LocalStrategy = require('passport-local').Strategy

const db = require('./models')
const router = require('./router')
const {Users} = require('./models')
const logger = require('./utils/logger')
const menu = require('./menu/menu.json')
const config = require('./config/config')
const {version} = require('./package.json')
const {makeUrl} = require('./utils/make-url')
const {getMarksForSkill} = require('./utils/marks')
const {formatDateShort, formatTime} = require('./utils/format-date')

const errorTitles = {
    400: 'Некорректный запрос',
    404: 'Не найдено',
    500: 'Ошибка',
}

logger.info('~~~ Starting ClassJournal APP ~~~');
logger.info({config}, 'app config');

const hyphenator = hyphenopoly.config({
    "require": ["en-us", "ru"]
});


const koaLogger = new KoaReqLogger({
    pinoInstance: logger,
    alwaysError: true // treat all non-2** http codes as error records in logs
});


passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findByPk(id)
        done(null, user)
    } catch (err) {
        done(err)
    }
})
passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await Users.findOne({
            where: {
                email: username
            }
        });
        if (user) {
            if (user.password === crypto.scryptSync(password, config.hashSecret, 64).toString('hex')) {
                done(null, user);
            } else {
                done(null, false)
            }
        } else {
            done(null, false)
        }
    }
))

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
        ctx.set('X-Version', version);
        try {
            ctx.state.title = 'Журнал';
            ctx.state.failure = false;
            ctx.state.activeMenu = '';
            ctx.state.user = null;
            ctx.state.breadcrumbs = [];
            ctx.state.formatDateShort = formatDateShort;
            ctx.state.formatTime = formatTime;
            ctx.state.getMarksForSkill = getMarksForSkill;
            ctx.state.makeUrl = makeUrl;
            ctx.state.encodeURIComponent = encodeURIComponent;
            ctx.state.hyphenateText = await hyphenator.get("ru");
            ctx.state.absence_skill_id = config.absence_skill_id;
            ctx.state.lastModified = lastModified;

            await next()
        } catch (err) {
            ctx.status = err.status || 500;
            ctx.state.title = errorTitles[ctx.status] || 'Ошибка';
            ctx.state.failure = true;
            ctx.log.error(err)
            return ctx.render(ctx.status);
        }
    })
    .use(session({
        maxAge: 86400000,
        rolling: true,
        secure: config.env === 'production',
    }, app))
    .use(bodyParser())
    .use(passport.initialize())
    .use(passport.session())
    .use(async (ctx, next) => {
        ctx.state.isAuthenticated = ctx.isAuthenticated();
        ctx.state.menu = ctx.isAuthenticated() ? menu : {};
        return next();
    })
    .use(router.allowedMethods())
    .use(router.routes())
    .use(function*() {
        this.throw(404)
    });

db.sequelize.sync().then(() => {
    const port = config.serverPort;
    return app.listen(port, '0.0.0.0', () => {
        logger.info(`Server listening on port: ${port}`);
    });
})
