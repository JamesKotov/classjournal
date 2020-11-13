"use strict";
const {
    Model,
    Sequelize
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Lessons extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Lessons.belongsTo(models.Groups, {foreignKey: "group_id"});
            models.Lessons.belongsTo(models.Subjects, {foreignKey: "subject_id"});
            models.Lessons.hasMany(models.Marks, {foreignKey: "lesson_id"});
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
        ]
    });
    return Lessons;
};
