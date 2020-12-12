'use strict';

function getNowTime() {
    const now = new Date();
    now.setUTCHours(now.getHours());
    now.setUTCMinutes(now.getMinutes());
    now.setSeconds(null);
    now.setMilliseconds(null);
    return now;
}

module.exports = {getNowTime};
