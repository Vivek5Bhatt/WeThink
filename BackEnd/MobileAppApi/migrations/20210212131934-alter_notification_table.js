'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE notifications ADD COLUMN question_shared_id uuid`
      )
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "notifications" ADD constraint fk_notification_user_shared_id FOREIGN KEY (question_shared_id) REFERENCES "user_shared_questions" (question_shared_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE notifications ADD COLUMN  question_id uuid');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "notifications" ADD constraint fk_notification_user_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE notifications ADD COLUMN  comment_id uuid');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "notifications" ADD constraint fk_notification_comment_id FOREIGN KEY (comment_id) REFERENCES "user_comments" (comment_id)  ON DELETE CASCADE');
      });
  }
};
