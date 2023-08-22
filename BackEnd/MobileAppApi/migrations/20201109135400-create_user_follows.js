'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_follows",
      {
        follows_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        followed_by: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        followed_to: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_follow_requests" ADD constraint fk_follows_by_id FOREIGN KEY (followed_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_follow_requests" ADD constraint fk_follows_to_id FOREIGN KEY (followed_to) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_follows ON  "user_follow_requests"( followed_by, followed_to)');
      })
  }
};



