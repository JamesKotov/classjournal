"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Groups extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Groups.belongsTo(models.Users, { foreignKey: "user_id"});
            models.Groups.hasMany(models.Lessons, { foreignKey: "group_id"});
            models.Groups.belongsToMany(models.Students, { through: "StudentsToGroups" });
        }
    }

    Groups.init({
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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "преподаватель",
            references: {
                model: "Users",
                key: "id"
            }
        },
        class: {
            type: DataTypes.TINYINT,
            allowNull: false,
            comment: "класс"
        }
    }, {
        sequelize,
        tableName: "Groups",
        modelName: "Groups",
        comment: "Группы",
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
            {
                name: "user_id_FK",
                using: "BTREE",
                fields: [
                    { name: "user_id" },
                ]
            },
        ]
    });
    return Groups;
};
