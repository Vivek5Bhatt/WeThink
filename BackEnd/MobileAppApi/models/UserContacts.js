const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserContacts = sequelize.define(
    "user_contacts",
    {
        contact_id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        phone_number: {
            type: Sequelize.STRING(30),
            allowNull: false
        },
        created_at: {
            type: Sequelize.BIGINT
        },
        contact_name: {
            type: Sequelize.STRING(70)
        }
    },
    {
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = UserContacts