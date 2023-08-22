'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("questions_images",
      {
        question_image_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        image_url: {
          type: Sequelize.TEXT,
        }
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_questions_category ON  "question_category_mapping"(question_id, category_id)');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "questions_images" ADD constraint fk_question_image_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      })
  }
};
