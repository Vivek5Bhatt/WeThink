const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const ThresholdMaster = sequelize.define(
    "threshold_master",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        threshold_count: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        type: {
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

module.exports = ThresholdMaster