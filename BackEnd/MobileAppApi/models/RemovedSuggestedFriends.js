const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const RemovedSuggestedFriends = sequelize.define(
    "removed_suggested_friends",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        removed_by: {
            type: Sequelize.UUID,
            allowNull: false
        },
        removed_to: {
            type: Sequelize.UUID,
            allowNull: false
        },
        created_at: {
            type: Sequelize.BIGINT,
            defaultValue: Date.now()
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = RemovedSuggestedFriends