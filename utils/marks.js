'use strict'

const {Marks} = require('../models');
const all_marks = Marks.rawAttributes['mark'].values;

function getMarksForSkill(skill_id, absence_skill_id) {
    if (skill_id === absence_skill_id) {
        return [''].concat(all_marks.slice(0, 2));
    }
    return [''].concat(all_marks.slice(2))
}

function isMarkValid(mark, skill_id, absence_skill_id) {
    if (mark === '') {
        return true;
    }

    const marks = getMarksForSkill(skill_id, absence_skill_id);

    return marks.indexOf(mark) >= 0;
}

module.exports = {getMarksForSkill, isMarkValid};
