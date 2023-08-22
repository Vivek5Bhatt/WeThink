'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("reported_questions",
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
        report_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        is_available: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_questions" ADD constraint fk_post_report_id FOREIGN KEY (reported_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_questions" ADD constraint fk_post_post_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_questions" ADD constraint fk_post_report_post_id FOREIGN KEY (question_shared_id) REFERENCES "user_shared_questions" (question_shared_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_questions" ADD constraint fk_post_reason_id FOREIGN KEY (report_reason_id) REFERENCES "report_master" (id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_comments" ADD COLUMN "is_available" BOOLEAN DEFAULT false');
      })
  }
};
