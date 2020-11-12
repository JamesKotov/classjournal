'use strict';

const envUtils = require('../utils/env');
const getEnvVariable = envUtils.getEnvVariable;

const config = {
    env: getEnvVariable('NODE_ENV', 'dev'),

    logLevel: getEnvVariable('LOG_LEVEL', 'debug'),

    serverPort: +getEnvVariable('PORT', 3000),

    dbDsn: getEnvVariable('DB_DSN', ''),

    hashSecret: getEnvVariable('HASH_SECRET', ''),

};

module.exports = config;
