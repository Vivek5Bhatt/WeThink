const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UsersDevices = sequelize.define(
    "user_devices",
    {
        user_device_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        device_token: {
            type: Sequelize.STRING,
            allowNull: false
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        sns_arn_endpoint: {
            type: Sequelize.TEXT
        },
        subscriber_arn_endpoint: {
            type: Sequelize.TEXT
        },
        device_type: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        notification_enabled: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    },
    {
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = UsersDevices