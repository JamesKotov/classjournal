"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SkillSets extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.SkillSets.belongsTo(models.Skills, {foreignKey: "skill_id"});
            models.SkillSets.belongsTo(models.Subjects, {foreignKey: "subject_id"});
        }
    }

    SkillSets.init({
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "id"
        },
        subject_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "предмет",
            references: {
                model: "Subjects",
                key: "id"
            }
        },
        class: {
            type: DataTypes.TINYINT,
            allowNull: false,
            comment: "класс"
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
        skill_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "порядок сортировки",
            defaultValue: 0,
        },
    }, {
        sequelize,
        tableName: "SkillSets",
        modelName: "SkillSets",
        comment: "Наборы навыков",
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
                name: "uniq_idx",
                unique: true,
                using: "BTREE",
                fields: [
                    {name: "subject_id"},
                    {name: "class"},
                    {name: "skill_id"},
                ]
            },
            {
                name: "skill_id_FK",
                using: "BTREE",
                fields: [
                    {name: "skill_id"},
                ]
            },
            {
                name: "subject_id_FK",
                using: "BTREE",
                fields: [
                    {name: "subject_id"},
                ]
            },
        ]
    });
    return SkillSets;
};
