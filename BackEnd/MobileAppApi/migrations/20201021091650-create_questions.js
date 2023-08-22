'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("questions",
      {
        question_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        created_by: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        question_date: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        updated_by: {
          type: Sequelize.UUID,
        },
        is_deleted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
        },
        question_title: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        question_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        is_commenting_enabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "questions" ADD constraint fk_question_created_id FOREIGN KEY (created_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "questions" ADD constraint fk_question_updated_id FOREIGN KEY (created_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
