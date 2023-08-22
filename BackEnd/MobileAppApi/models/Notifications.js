const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const Notifications = sequelize.define(
    "notifications",
    {
        notification_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        sender_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        receiver_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        type: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        event_id: {
            type: Sequelize.UUID
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        seen: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        is_read: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_deleted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        question_shared_id: {
            type: Sequelize.UUID
        },
        question_id: {
            type: Sequelize.UUID
        },
        comment_id: {
            type: Sequelize.UUID
        },
        parent_comment_id: {
            type: Sequelize.UUID
        },
        request_form_id: {
            type: Sequelize.UUID,
            references: {
                model: 'RequestVerificationForm',
                key: 'id',
            }
        },
        reject_reason: {
            type: Sequelize.STRING
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = Notifications