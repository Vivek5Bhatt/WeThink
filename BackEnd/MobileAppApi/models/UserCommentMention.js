const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserCommentsMention = sequelize.define(
    "user_comment_mentions",
    {
        comment_mention_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        comment_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false
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

module.exports = UserCommentsMention