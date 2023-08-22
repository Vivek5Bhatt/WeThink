'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_friends",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        friend_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_friend_friend ON  "user_friends"(user_id, friend_id)');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_friends" ADD constraint fk_user_friend_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_friends" ADD constraint fk_user_friend_friend_id FOREIGN KEY (friend_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
