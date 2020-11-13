"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Subjects extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Subjects.hasMany(models.Lessons, {foreignKey: "subject_id"});
            models.Subjects.hasMany(models.SkillSets, {foreignKey: "subject_id"});
        }
    }

    Subjects.init({
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
        tableName: "Subjects",
        modelName: "Subjects",
        comment: "Предметы",
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
    return Subjects;
};
