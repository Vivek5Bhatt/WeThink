const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserBlocks = sequelize.define(
    "user_blocks",
    {
        block_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        blocked_by: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        blocked_to: {
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

module.exports = UserBlocks