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
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        is_deleted:{
            type: Sequelize.BOOLEAN,
            defaultValue:false
        },
        type:{
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = ReportMaster