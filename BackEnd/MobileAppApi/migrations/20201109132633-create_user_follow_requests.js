'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_follow_requests",
      {
        follow_request_id: {
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
        request_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.BIGINT,
        },
        accepted_at: {
          type: Sequelize.BIGINT,
        },
        rejected_at: {
          type: Sequelize.BIGINT,
        },
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_follow_requests" ADD constraint fk_followed_by_id FOREIGN KEY (followed_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_follow_requests" ADD constraint fk_followed_to_id FOREIGN KEY (followed_to) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_follow_requests ON  "user_follow_requests"( followed_by, followed_to)');
      })
  }
};



