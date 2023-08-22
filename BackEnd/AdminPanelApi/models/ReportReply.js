const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const AdminReportReply = sequelize.define(
    "admin_report_replies",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        admin_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        reported_user_id: {
            type: Sequelize.UUID,
        },
        reported_question_id: {
            type: Sequelize.UUID
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        type: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        reply_message: {
            type: Sequelize.STRING(1000),
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = AdminReportReply