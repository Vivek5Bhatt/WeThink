'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_comment_mentions",
      {
        comment_mention_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        comment_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_comments" ADD constraint fk_comment_id FOREIGN KEY (comment_id) REFERENCES "user_comments" (comment_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_comment_mentions" ADD constraint fk_comment_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_comment ON  "user_comment_mentions"( comment_id, user_id)');
      })
  }
};
