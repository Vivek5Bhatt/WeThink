'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_user_follows').then(() => {
      return queryInterface.sequelize.query('ALTER TABLE user_follow_requests DROP CONSTRAINT fk_follows_by_id;')
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE user_follow_requests DROP CONSTRAINT fk_follows_to_id;')
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "user_follows" ADD constraint fk_follows_by_id FOREIGN KEY (followed_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "user_follows" ADD constraint fk_follows_to_id FOREIGN KEY (followed_to) REFERENCES "users" (user_id)  ON DELETE CASCADE');
    }).then(() => {
      return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_follows ON  "user_follows"(followed_by, followed_to)')
    })
  }
};
