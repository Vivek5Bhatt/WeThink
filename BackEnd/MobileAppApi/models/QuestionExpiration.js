const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const QuestionExpirationModel = sequelize.define(
    "question_expiration",
    {
        question_expiration_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        question_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        expiry_time: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        expiration_type: {
            type: Sequelize.INTEGER
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = QuestionExpirationModel