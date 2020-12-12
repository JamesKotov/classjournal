'use strict';

const envUtils = require('../utils/env');
const getEnvVariable = envUtils.getEnvVariable;

const ABSENCE_SKILL_ID = 1;
const MAX_SKILLS_PER_PAGE = 13;

const config = {
    env: getEnvVariable('NODE_ENV', 'dev'),

    logLevel: getEnvVariable('LOG_LEVEL', 'debug'),

    serverPort: +getEnvVariable('PORT', 3000),

    dbDsn: getEnvVariable('DB_DSN', ''),

    hashSecret: getEnvVariable('HASH_SECRET', ''),

    absence_skill_id: ABSENCE_SKILL_ID,

    max_skills_per_page: MAX_SKILLS_PER_PAGE,

};

module.exports = config;
