'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE INDEX user_name_trgm_gin ON users USING GIN(user_name gin_trgm_ops);').then(() => {
      return queryInterface.sequelize.query('ALTER TABLE user_comments ADD COLUMN is_deleted BOOLEAN default false')
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE user_comments ADD COLUMN is_active BOOLEAN default true')
    }).then(() => {
      return queryInterface.sequelize.query('DROP INDEX idx_user_shared_questions')
    })
  }
};