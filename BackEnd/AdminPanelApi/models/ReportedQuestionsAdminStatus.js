const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const ReportedQuestionsAdminStatus = sequelize.define(
    "reported_questions_admin_status",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        question_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        is_accepted:{
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        reject_reason:{
            type: Sequelize.STRING
        },
        created_by:{
            type: Sequelize.UUID,
            allowNull: false
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: Date.now()
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = ReportedQuestionsAdminStatus