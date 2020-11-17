"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Quarters extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Quarters.hasMany(models.Lessons, { foreignKey: "quarter_id"});
        }
    }

    Quarters.init({
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
            comment: "название"
        },
        begin: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "дата начала"
        },
        end: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "дата окончания"
        }
    }, {
        sequelize,
        tableName: "Quarters",
        modelName: "Quarters",
        comment: "Пользователи",
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
                    { name: "id" },
                ]
            },
        ]
    });
    return Quarters;
};
