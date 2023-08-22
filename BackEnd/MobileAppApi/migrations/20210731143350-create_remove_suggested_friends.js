'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("removed_suggested_friends",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        removed_by: {
          type: Sequelize.UUID,
          allowNull: false
        },
        removed_to: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "removed_suggested_friends" ADD constraint fk_removed_by FOREIGN KEY (removed_by) REFERENCES "users" (user_id) ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "removed_suggested_friends" ADD constraint fk_removed_to FOREIGN KEY (removed_to) REFERENCES "users" (user_id) ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_removed_suggested_friends ON  "removed_suggested_friends"(removed_by, removed_to)');
      })
  }
};