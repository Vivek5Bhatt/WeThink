const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const UserSharedQuestions = sequelize.define(
    "user_shared_questions",
    {

        question_shared_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        question_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        share_message: {
            type: Sequelize.TEXT
        },
        is_deleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        is_commenting_enabled: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
          },
    },
    {
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = UserSharedQuestions