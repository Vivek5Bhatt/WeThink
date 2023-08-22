const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const QuestionsCategory = sequelize.define(
    "question_category_mapping",
    {
        question_category_id: {
            type: Sequelize.UUID,
            primaryKey: true,
          },
          question_id: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          category_id: {
            type: Sequelize.UUID,
            allowNull: false
          }
      },
    {
        freezeTableName:true,
        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = QuestionsCategory