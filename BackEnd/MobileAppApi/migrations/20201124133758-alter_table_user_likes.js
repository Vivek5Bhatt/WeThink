'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `DROP INDEX IF EXISTS idx_user_likes`
      )
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE user_likes ADD COLUMN question_shared_id uuid');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_likes" ADD constraint fk_like_shared_id FOREIGN KEY (question_shared_id) REFERENCES "user_shared_questions" (question_shared_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_likes_shared ON  "user_likes"(user_id, question_shared_id)');
      });
  }
};
