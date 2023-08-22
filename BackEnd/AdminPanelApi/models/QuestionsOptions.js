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
            allowNull:false
          },
          option_number:{
            type:Sequelize.INTEGER
          }
      },
    {
        freezeTableName:true,

        onDelete: "cascade",
        timestamps: false,
    }
);


module.exports = QuestionOptions