'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE user_shared_questions ADD COLUMN is_commenting_enabled BOOLEAN DEFAULT true`
      )
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE user_shared_questions ADD COLUMN is_active BOOLEAN DEFAULT true');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE user_shared_questions ADD COLUMN is_deleted BOOLEAN DEFAULT false');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE user_shared_questions ADD COLUMN deleted_at BIGINT');
      });
  }
};
