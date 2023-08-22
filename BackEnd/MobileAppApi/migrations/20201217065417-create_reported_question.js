'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("reported_comments",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        reported_by: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        question_shared_id: {
          type: Sequelize.UUID
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        report_reason_id: {
          type: Sequelize.UUID
        },
        other_reason: {
          type: Sequelize.STRING
        },
        updated_at: {
          type: Sequelize.BIGINT
        },
        comment_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        report_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_comments" ADD constraint fk_report_user_id FOREIGN KEY (reported_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_comments" ADD constraint fk_report_post_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_comments" ADD constraint fk_shared_report_post_id FOREIGN KEY (question_shared_id) REFERENCES "user_shared_questions" (question_shared_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_comments" ADD constraint fk_report_reason_id FOREIGN KEY (report_reason_id) REFERENCES "report_master" (id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_comments" ADD constraint fk_report_comment_id FOREIGN KEY (comment_id) REFERENCES "user_comments" (comment_id)  ON DELETE CASCADE');
      })
  }
};
