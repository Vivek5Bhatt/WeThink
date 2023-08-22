'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE user_comments ADD COLUMN order_id serial`
      ).then(() => {
        return queryInterface.sequelize.query(`ALTER TABLE notifications ADD COLUMN parent_comment_id UUID`);
      }).then(() => {
        return queryInterface.sequelize.query(`ALTER TABLE "notifications" ADD constraint notification_parent_id FOREIGN KEY (parent_comment_id) REFERENCES "user_comments" (comment_id)  ON DELETE CASCADE`);
      })
  }
};
