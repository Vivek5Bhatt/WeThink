'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_comments",
      {
        comment_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.BIGINT,
        },
        parent_id: {
          type: Sequelize.UUID,
          allowNull: true
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_comments" ADD constraint fk_user_comments_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_comments" ADD constraint fk_user_comment_question_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_comments" ADD constraint fk_user_comment_parent_id FOREIGN KEY (parent_id) REFERENCES "user_comments" (comment_id)  ON DELETE CASCADE');
      })
  }
};


