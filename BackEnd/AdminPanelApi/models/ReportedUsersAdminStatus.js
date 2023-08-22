const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const ReportedUsersAdminStatus = sequelize.define(
    "reported_users_admin_status",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        status:{
            type: Sequelize.INTEGER,
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


module.exports = ReportedUsersAdminStatus