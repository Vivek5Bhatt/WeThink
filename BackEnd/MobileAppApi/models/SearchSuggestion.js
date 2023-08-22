const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const SearchSuggestions = sequelize.define(
    "search_suggestions",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        searched_user_id: {
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

module.exports = SearchSuggestions