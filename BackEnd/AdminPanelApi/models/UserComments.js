const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const UserComments = sequelize.define(
    "user_comments",
    {
        comment_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        comment: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        question_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        updated_at: {
            type: Sequelize.BIGINT,
        },
        parent_id: {
            type: Sequelize.UUID,
            allowNull: true
        },
        is_deleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        question_shared_id: {
            type: Sequelize.UUID,
            allowNull: true
        },
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = UserComments