const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const Notifications = sequelize.define(
    "post_comment_threshold_count",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        comment_id: {
            type: Sequelize.UUID,
        },
        question_id: {
            type: Sequelize.UUID
        },
        type: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        threshold_count: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        report_count: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        is_available: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        question_shared_id: {
            type: Sequelize.UUID
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = Notifications