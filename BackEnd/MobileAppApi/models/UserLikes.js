const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserLikes = sequelize.define(
    "user_likes",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        question_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        question_shared_id: {
            type: Sequelize.UUID,
            allowNull: true
        },
    },
    {
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = UserLikes