'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("post_comment_threshold_count",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        comment_id: {
          type: Sequelize.UUID,
        },
        question_id: {
          type: Sequelize.UUID
        },
        type: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        threshold_count: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        report_count: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        is_available: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "post_comment_threshold_count" ADD constraint fk_count_post_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "post_comment_threshold_count" ADD constraint fk_count_comment_id FOREIGN KEY (comment_id) REFERENCES "user_comments" (comment_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_questions" DROP COLUMN IF EXISTS is_available');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_comments" DROP COLUMN IF EXISTS is_available');
      })
  }
};
