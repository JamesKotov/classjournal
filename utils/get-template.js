'use strict'
const path = require('path');


function getTemplate(fname) {
    return path.parse(fname).name
}

module.exports = {getTemplate};


