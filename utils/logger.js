'use strict';

const pino = require('pino');
const {reqSerializer, resSerializer, errSerializer} = require('koa-req-logger');

const config = require('../config/config');

// logger and errors handler
const pinoLogger = pino({
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
