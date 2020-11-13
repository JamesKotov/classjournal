"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Skills extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Skills.hasMany(models.Marks, {foreignKey: "skill_id"});
            models.Skills.hasMany(models.SkillSets, {foreignKey: "skill_id"});
        }
    }

    Skills.init({
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "id"
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "название",
            unique: "uniq_idx"
        }
    }, {
        sequelize,
        tableName: "Skills",
        modelName: "Skills",
        comment: "Навыки",
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
                    {name: "name"},
                ]
            },
        ]
    });
    return Skills;
};
