'use strict';

const fs = require('fs');
const csso = require('csso');
const path = require('path');
const dir = require('node-dir');
const parse = require("node-html-parser").default;

const styleFiles = ['../static/bootstrap.css', '../static/custom.css']
const templatesDir = '../views'
const forceClasses = ['active', 'border-primary', 'text-primary', 'is-invalid', 'invalid-feedback', 'text-white',
    'font-weight-bold']

async function getCss() {

    const regex = /<%[^%>]*%>/gmi;

    const filesContents = await new Promise((resolve, reject) => {
        const f = [];

        dir.readFiles(path.join(__dirname, templatesDir),
            function (err, content, next) {
                if (err) reject(err);
                f.push(content.replace(regex, ''));

                next();
            },
            function (err) {
                if (err) reject(err);
                resolve(f);
            });
    });

    const tags = [];
    const classes = [];

    filesContents.forEach(f => {
        const root = parse(f);
        tags.push(
            [...new Set(Array.from(root.querySelectorAll('*')).map(el => el.tagName).filter(Boolean))]
        );
        classes.push(
            [...new Set((Array.from(root.querySelectorAll('*')).map(el => el.classNames)).flat().filter(Boolean))]
        );
    });

    const uniqTags = [...new Set(tags.flat())].sort();

    const uniqClasses = [...new Set(classes.flat())].map(c => c.replace('"', '')).concat(forceClasses);
    uniqClasses.sort()

    const options = {
        usage: {
            tags: uniqTags,
            classes: uniqClasses,
        },
        sourceMap: false,
        comments: false,
    }

    let body = ''

    styleFiles.forEach(file => {
        body += fs.readFileSync(path.join(__dirname, file))
    })

    return csso.minify(body, options).css;
}

module.exports = (async function() {
    return await getCss();
})();
