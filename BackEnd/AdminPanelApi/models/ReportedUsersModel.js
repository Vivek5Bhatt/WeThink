const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const ReportedUsers = sequelize.define(
    "reported_users",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        reported_by: {
            type: Sequelize.UUID,
            allowNull: false
        },
        reported_to: {
            type: Sequelize.UUID,
            allowNull: false
        },
        other_reason: {
            type: Sequelize.STRING
        },
        report_reason_id: {
            type: Sequelize.UUID
        },
        updated_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        report_status: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = ReportedUsers