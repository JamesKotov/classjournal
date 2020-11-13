"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Marks extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Marks.belongsTo(models.Lessons, {foreignKey: "lesson_id"});
            models.Marks.belongsTo(models.Skills, {foreignKey: "skill_id"});
            models.Marks.belongsTo(models.Students, {foreignKey: "student_id"});
        }
    }

    Marks.init({
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "id"
        },
        lesson_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "группа",
            references: {
                model: "Lessons",
                key: "id"
            }
        },
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "ученик",
            references: {
                model: "Students",
                key: "id"
            }
        },
        skill_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "навык",
            references: {
                model: "Skills",
                key: "id"
            }
        },
        mark: {
            type: DataTypes.ENUM("Н", "2", "3-", "3", "3+", "4-", "4", "4+", "5-", "5", "5+"),
            allowNull: false,
            comment: "оценка"
        }
    }, {
        sequelize,
        tableName: "Marks",
        modelName: "Marks",
        comment: "Оценки",
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
                name: "mark_student_id_FK",
                using: "BTREE",
                fields: [
                    {name: "student_id"},
                ]
            },
            {
                name: "mark_lesson_id_FK",
                using: "BTREE",
                fields: [
                    {name: "lesson_id"},
                ]
            },
            {
                name: "mark_skill_id_FK",
                using: "BTREE",
                fields: [
                    {name: "skill_id"},
                ]
            },
        ]
    });
    return Marks;
};
