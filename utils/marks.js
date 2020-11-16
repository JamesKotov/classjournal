'use strict'

const {Marks} = require('../models');
const all_marks = Marks.rawAttributes['mark'].values;

function getMarksForSkill(skill_id, absence_skill_id) {
    if (skill_id === absence_skill_id) {
        return all_marks.slice(0, 1);
    }
    return [''].concat(all_marks.slice(1))
}

function isCurrentMark(marks, lesson_id, student_id, skill_id, mark) {
    if (!Array.isArray(marks)) {
        return false;
    }
    lesson_id = lesson_id || 0;
    student_id = student_id || 0;
    skill_id = skill_id || 0;
    mark = mark || '';

    if (!marks.length || !lesson_id || !student_id || !skill_id || !mark) {
        return false
    }

    return !!marks.find(m => m.lesson_id === lesson_id && m.student_id === student_id && m.skill_id === skill_id && m.mark === mark)
}

function isMarkValid(mark, skill_id, absence_skill_id) {
    if (mark === '') {
        return true;
    }

    const marks = getMarksForSkill(skill_id, absence_skill_id);

    return marks.indexOf(mark) >= 0;
}

module.exports = {getMarksForSkill, isCurrentMark, isMarkValid};
