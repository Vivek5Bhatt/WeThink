'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_blocks",
      {
        block_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        blocked_by: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        blocked_to: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_blocks" ADD constraint fk_blocked_by_id FOREIGN KEY (blocked_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_blocks" ADD constraint fk_blocked_to_id FOREIGN KEY (blocked_to) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_blocks ON  "user_blocks"( blocked_by, blocked_to)');
      })
  }
};



