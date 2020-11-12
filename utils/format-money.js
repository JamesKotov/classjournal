'use strict'

/**
 * format(a, n, x, s, c)
 *
 * @param a: formatting number
 * @param n: length of decimal
 * @param x: length of whole part
 * @param s: sections delimiter
 * @param c: decimal delimiter
 */
function formatMoney(a, n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = a.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
}

module.exports = formatMoney;
