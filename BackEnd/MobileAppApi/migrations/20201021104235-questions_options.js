'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("question_options",
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
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "question_options" ADD constraint fk_question_option_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      })
  }
};
