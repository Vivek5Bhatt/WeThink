const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const ReportedQuestions = sequelize.define(
    "reported_questions",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        reported_by: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        question_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        question_shared_id: {
            type: Sequelize.UUID
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        report_reason_id: {
            type: Sequelize.UUID
        },
        other_reason: {
            type: Sequelize.STRING
        },
        updated_at: {
            type: Sequelize.BIGINT
        },
        report_status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        user_channel_id:{
            type: Sequelize.STRING(155)
        },
        group_channel_id:{
            type: Sequelize.STRING(155)
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = ReportedQuestions