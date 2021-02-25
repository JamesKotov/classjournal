'use strict';

const pdf = require('html-pdf');

const config = require("../config/config");

async function renderPdf(html) {
    const pdfOptions = {
        format: 'A4',
        orientation: config.pdf_orientation,
        border: config.pdf_margins + 'mm',
        type: "pdf",
        dpi: 200,
        quality: 80,
        zoomFactor: "1",
        paginationOffset: 1,
        footer: {
            height: (config.pdf_margins - 2) + 'mm',
            contents: {
                default: '<div style="text-align: center"><br/><small>страница {{page}} из {{pages}}</small></div>',
            }
        },
    };
    return new Promise((resolve, reject) => {
        pdf.create(html, pdfOptions).toBuffer(async function (err, buffer) {
            if (err) return reject(err);
            resolve(buffer);
        });
    });
}

module.exports = renderPdf;
