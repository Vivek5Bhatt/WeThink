'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("deleted_account",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        deleted_date: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "deleted_account" ADD constraint fk_delete_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT false');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE users ADD COLUMN deleted_at BIGINT');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_deleted_account ON  "deleted_account" (user_id)');
      })
  }
};
