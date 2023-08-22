const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const QuestionMasterExpiryHours = sequelize.define(
    "question_master_expiry_hours",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        expiry_hours: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = QuestionMasterExpiryHours