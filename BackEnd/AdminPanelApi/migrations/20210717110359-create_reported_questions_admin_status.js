'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("reported_questions_admin_status",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        is_accepted:{
          type: Sequelize.BOOLEAN,
          allowNull: false
        },
        reject_reason:{
          type: Sequelize.STRING
        },
        created_by:{
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: Date.now()
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_questions_admin_status" ADD constraint fk_reported_post_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_questions_admin_status" ADD constraint fk_reported_admin_id FOREIGN KEY (created_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
