"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Specialities extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            models.Specialities.hasMany(models.Students, {foreignKey: "specialty_id"});
        }
    }

    Specialities.init({
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "id"
        },
        teacher: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "преподаватель по специальности"
        },
        instrument: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "инструмент"
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "отделение"
        }
    }, {
        sequelize,
        tableName: "Specialities",
        modelName: "Specialities",
        comment: "Специальности",
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
                    {name: "instrument"},
                    {name: "teacher"},
                ]
            },
        ]
    });
    return Specialities;
};
