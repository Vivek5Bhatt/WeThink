const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserFollowRequest = sequelize.define(
    "user_follows",
    {
        follows_id: {
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
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        }
    },
    {
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = UserFollowRequest