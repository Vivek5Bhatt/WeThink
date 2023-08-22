const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const QuestionSearchSuggestions = sequelize.define(
  "question_search_suggestions", {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  search: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
},
  {
    freezeTableName: true,
    onDelete: "cascade",
    timestamps: false,
  }
);

module.exports = QuestionSearchSuggestions