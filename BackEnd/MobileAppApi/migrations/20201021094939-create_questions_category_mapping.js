'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("question_category_mapping",
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
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "question_category_mapping" ADD constraint fk_question_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "question_category_mapping" ADD constraint fk_question_category_id FOREIGN KEY (category_id) REFERENCES "questions_categories_master" (category_id)  ON DELETE CASCADE');
      })
  }
};
