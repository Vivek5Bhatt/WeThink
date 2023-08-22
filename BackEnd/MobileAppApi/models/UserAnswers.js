const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserAnswers = sequelize.define(
    "user_answers",
    {
        user_answer_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        answer_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        question_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        updated_at: {
            type: Sequelize.BIGINT
        },
        answer_reason: {
            type: Sequelize.TEXT
        },
        state_symbol: {
            type: Sequelize.STRING(20)
        },
        county: {
            type: Sequelize.STRING(70)
        },
        state: {
            type: Sequelize.STRING(155)
        },
        gender: {
            type: Sequelize.INTEGER
        },
        rating: {
            type: Sequelize.NUMERIC(2, 1)
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = UserAnswers