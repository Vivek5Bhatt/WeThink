const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserFriends = sequelize.define(
    "user_friends",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        friend_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        is_officially_verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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

module.exports = UserFriends