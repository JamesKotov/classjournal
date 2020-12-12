'use strict';

const pino = require('pino');
const {reqSerializer, resSerializer, errSerializer} = require('koa-req-logger');

const config = require('../config/config');
const {version} = require('../package.json');

// logger and errors handler
const pinoLogger = pino({
    base: {ver: version},
    level: config.logLevel,
    formatters: {
        level: (label) => {
            return {level: label};
        },
    },
    timestamp: pino.stdTimeFunctions.unixTime,
    serializers: {
        req: reqSerializer,
        res: resSerializer,
        err: errSerializer,
    },
});

module.exports = pinoLogger;
