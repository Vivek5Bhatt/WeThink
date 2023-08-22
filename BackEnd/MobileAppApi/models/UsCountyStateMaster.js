const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UsCountyStateMaster = sequelize.define(
    "us_state_county_master",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        state_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        state_code: {
            type: Sequelize.STRING,
            allowNull: true
        },
        state_data: {
            type: Sequelize.JSONB,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = UsCountyStateMaster