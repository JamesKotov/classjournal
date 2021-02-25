'use strict';

const envUtils = require('../utils/env');
const getEnvVariable = envUtils.getEnvVariable;

const ABSENCE_SKILL_ID = 1;
// const PDF_ORIENTATION = 'landscape'
const PDF_ORIENTATION = 'portrait'
const PDF_MARGINS = 10;
const PDF_CELL_WIDTH = 18;

const pageWidth = {
    'portrait': 210,
    'landscape': 297,
}

const pdf_width = pageWidth[PDF_ORIENTATION] - (2 * PDF_MARGINS);

const pdf_max_skills_per_page = Math.floor((pdf_width - (2 * PDF_CELL_WIDTH)) / PDF_CELL_WIDTH);

const env = getEnvVariable('NODE_ENV', 'dev');

const isProduction = env === 'production';

const config = {
    env: env,

    logLevel: getEnvVariable('LOG_LEVEL', 'debug'),

    serverPort: +getEnvVariable('PORT', 3000),

    dbDsn: getEnvVariable('DB_DSN', ''),

    hashSecret: getEnvVariable('HASH_SECRET', ''),

    absence_skill_id: ABSENCE_SKILL_ID,

    pdf_max_skills_per_page: pdf_max_skills_per_page,

    pdf_zoom_factor: isProduction ? 0.75 : 1,

    pdf_orientation: PDF_ORIENTATION,

    pdf_margins: PDF_MARGINS,

    pdf_width: pdf_width,

    pdf_cell_width: PDF_CELL_WIDTH,

};

module.exports = config;
