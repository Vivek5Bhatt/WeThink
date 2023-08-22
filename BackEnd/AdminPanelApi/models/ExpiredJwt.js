const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const ExpiredJwtTokens = sequelize.define(
    "expired_jwt_tokens",
    {
        expired_jwt_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        token: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        created_at: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = ExpiredJwtTokens