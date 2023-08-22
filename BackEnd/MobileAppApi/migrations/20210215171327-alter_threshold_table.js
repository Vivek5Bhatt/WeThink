'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE post_comment_threshold_count ADD COLUMN question_shared_id uuid`
      ).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "post_comment_threshold_count" ADD constraint threshold_question_shared_id FOREIGN KEY (question_shared_id) REFERENCES "user_shared_questions" (question_shared_id)  ON DELETE CASCADE');
      })
  }
};
