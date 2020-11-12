'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    User.init({
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "id"
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "e-mail",
            unique: "email_uniq_idx"
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "пароль"
        },
        role: {
            type: DataTypes.ENUM('guest', 'teacher', 'admin'),
            allowNull: false,
            comment: "роль"
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "имя"
        },
        surname: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "фамилия"
        },
        patronimic: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "отчество"
        },
        gender: {
            type: DataTypes.ENUM('male', 'female'),
            allowNull: false,
            comment: "пол"
        }
    }, {
        sequelize,
        tableName: "Users",
        modelName: 'User',
        comment: "Пользователи",
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8',
        collate: 'utf8_general_ci',
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
                name: "email_uniq_idx",
                unique: true,
                using: "BTREE",
                fields: [
                    {name: "email"},
                ]
            },
        ]
    });
    return User;
};
