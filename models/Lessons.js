"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Lessons extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        _delimeter = ':';

        _marks = {};

        used_skills = [];

        skill_marks = {};

        hasMark = function (lesson_id = 0, student_id = 0, skill_id = 0, mark = '') {
            const self = this;
            return self._marks.hasOwnProperty(Array.from(arguments).join(self._delimeter))
        }

        initLesson = function (skillsets = [], absence_skill_id = 0, all_marks = []) {
            const self = this;
            self._marks = self.Marks.reduce(function (accumulator, m) {
                accumulator[
                    [m.lesson_id, m.student_id, m.skill_id, m.mark].join(self._delimeter)
                    ] = true;
                return accumulator;
            }, {})

            const used_skills = [...new Set(self.Marks.map(m => m.skill_id))];
            self.used_skills = skillsets.filter(s => used_skills.indexOf(s.skill_id) >= 0);

            self.used_skills.forEach(skill => {
                if (skill.skill_id === absence_skill_id) {
                    self.skill_marks[skill.skill_id] = [''].concat(all_marks.slice(0, 2));
                } else {
                    self.skill_marks[skill.skill_id] = [''].concat(all_marks.slice(2))
                }
            })
        }

        static associate(models) {
            // define association here
            models.Lessons.belongsTo(models.Groups, {foreignKey: "group_id"});
            models.Lessons.belongsTo(models.Subjects, {foreignKey: "subject_id"});
            models.Lessons.hasMany(models.Marks, {foreignKey: "lesson_id"});
            models.Lessons.belongsTo(models.Quarters, {foreignKey: "quarter_id"});
        }
    }

    Lessons.init({
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "id"
        },
        quarter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Quarters',
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: "дата"
        },
        time: {
            type: DataTypes.TIME,
            allowNull: true
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "группа",
            references: {
                model: 'Groups',
                key: 'id'
            }
        },
        subject_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "предмет",
            references: {
                model: 'Subjects',
                key: 'id'
            }
        },
        topic: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "тема"
        },
        task: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "задание"
        },
        is_distant: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "дистант?"
        },
        is_control: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "контрольный урок?"
        }
    }, {
        sequelize,
        tableName: "Lessons",
        modelName: "Lessons",
        comment: "Уроки",
        timestamps: false,
        engine: "InnoDB",
        charset: "utf8",
        collate: "utf8_general_ci",
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    {name: "id"},
                ]
            },
            {
                name: "lesson_group_id_FK",
                using: "BTREE",
                fields: [
                    {name: "group_id"},
                ]
            },
            {
                name: "lesson_subject_id_FK",
                using: "BTREE",
                fields: [
                    {name: "subject_id"},
                ]
            },
            {
                name: "quarter_id_FK",
                using: "BTREE",
                fields: [
                    {name: "quarter_id"},
                ]
            },
        ]
    });
    return Lessons;
};
