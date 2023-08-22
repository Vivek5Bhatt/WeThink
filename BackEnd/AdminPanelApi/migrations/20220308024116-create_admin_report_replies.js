'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("admin_report_replies",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        admin_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        reported_user_id: {
          type: Sequelize.UUID,
        },
        reported_question_id: {
          type: Sequelize.UUID
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        type: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        reply_message: {
          type: Sequelize.STRING(1000),
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "admin_report_replies" ADD constraint fk_reply_admin_id FOREIGN KEY (admin_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "admin_report_replies" ADD constraint fk_reply_user_report_id FOREIGN KEY (reported_user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "admin_report_replies" ADD constraint fk_reply_question_report_id FOREIGN KEY (reported_question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "admin_report_replies" ADD constraint fk_reply_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};