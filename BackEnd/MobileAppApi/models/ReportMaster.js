const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const ReportMaster = sequelize.define(
    "report_master",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        created_by: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 1
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = ReportMaster