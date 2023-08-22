const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const DeletedAccount = sequelize.define(
    "deleted_account",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        deleted_date: {
            type: Sequelize.BIGINT
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = DeletedAccount