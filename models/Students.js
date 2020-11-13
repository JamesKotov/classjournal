"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Students extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Students.hasMany(models.Marks, {foreignKey: "student_id"});
            models.Students.belongsToMany(models.Groups, { through: "StudentsToGroups" });
            models.Students.belongsTo(models.Specialities, {foreignKey: "specialty_id"});
        }
    }

    Students.init({
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "id"
        },
        surname: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "фамилия"
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "имя"
        },
        class: {
            type: DataTypes.TINYINT,
            allowNull: false,
            comment: "класс"
        },
        specialty_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "специальность",
            references: {
                model: "Specialities",
                key: "id"
            }
        },
        is_disabled: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "не активен"
        },
        disabled_since: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "не активен c"
        },
        disabled_for: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
            comment: "причина неактивности"
        }
    }, {
        sequelize,
        tableName: "Students",
        modelName: "Students",
        comment: "Ученики",
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
                name: "ns_uniq_idx",
                unique: true,
                using: "BTREE",
                fields: [
                    {name: "name"},
                    {name: "surname"},
                ]
            },
            {
                name: "specialty_id_FK",
                using: "BTREE",
                fields: [
                    {name: "specialty_id"},
                ]
            },
        ]
    });
    return Students;
};
