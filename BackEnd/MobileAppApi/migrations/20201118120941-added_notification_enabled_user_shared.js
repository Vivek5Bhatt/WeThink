'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE user_comments ADD COLUMN question_shared_id uuid`
      )
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_comments" ADD constraint fk_user_shared_id FOREIGN KEY (question_shared_id) REFERENCES "user_shared_questions" (question_shared_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE user_devices ADD COLUMN notification_enabled BOOLEAN DEFAULT true');
      });
  }
};
