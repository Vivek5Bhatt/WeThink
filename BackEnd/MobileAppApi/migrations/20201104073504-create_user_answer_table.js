'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_answers",
      {
        user_answer_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        answer_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.BIGINT
        },
        answer_reason: {
          type: Sequelize.TEXT
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_answers" ADD constraint fk_answer_question_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_answers" ADD constraint fk_answer_id FOREIGN KEY (answer_id) REFERENCES "question_options" (question_option_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_answers" ADD constraint fk_user_answer_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_question_answers ON  "user_answers" (user_id, answer_id,question_id)');
      })
  }
};
