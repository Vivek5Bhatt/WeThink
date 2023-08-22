const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const QuestionOptions = sequelize.define(
  "question_options",
  {
    question_option_id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    question_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    options: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    option_number: {
      type: Sequelize.INTEGER
    },
    start_rating: {
      type: Sequelize.NUMERIC(2, 1)
    }
  },
  {
    freezeTableName: true,
    onDelete: "cascade",
    timestamps: false,
  }
);

module.exports = QuestionOptions