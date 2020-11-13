"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class StudentsToGroups extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        }
    }

    StudentsToGroups.init({}, {
        sequelize,
        tableName: "StudentsToGroups",
        modelName: "StudentsToGroups",
        comment: "Ученики в группе",
        timestamps: false,
        engine: "InnoDB",
        charset: "utf8",
        collate: "utf8_general_ci",
        indexes: [
            {
                name: "group_id_FK",
                using: "BTREE",
                fields: [
                    {name: "groupId"},
                ]
            },
            {
                name: "student_id_FK",
                using: "BTREE",
                fields: [
                    {name: "studentId"},
                ]
            },
        ]
    });
    return StudentsToGroups;
};
