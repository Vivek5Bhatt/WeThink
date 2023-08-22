const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserFollowRequest = sequelize.define(
    "user_follow_requests",
    {
        follow_request_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        followed_by: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        followed_to: {
            type: Sequelize.UUID,
            allowNull: false
        },
        request_status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        updated_at: {
            type: Sequelize.BIGINT,
        },
        accepted_at: {
            type: Sequelize.BIGINT,
        },
        rejected_at: {
            type: Sequelize.BIGINT,
        },
    },
    {
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = UserFollowRequest