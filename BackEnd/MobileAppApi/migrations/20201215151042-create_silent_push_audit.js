'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("silent_push_audit",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: true
        },
        question_shared_id: {
          type: Sequelize.UUID,
          allowNull: true
        }
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_silent_push_audit ON  "silent_push_audit"(user_id, question_shared_id)');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "silent_push_audit" ADD constraint fk_user_silent_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "silent_push_audit" ADD constraint fk_user_silent_post_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "silent_push_audit" ADD constraint fk_shared_silent_post_id FOREIGN KEY (question_shared_id) REFERENCES "user_shared_questions" (question_shared_id)  ON DELETE CASCADE');
      })
  }
};
