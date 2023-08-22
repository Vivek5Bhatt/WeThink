"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "user_subscribers", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      subscribed_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      subscribed_to: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "user_subscribers" ADD constraint fk_user_subscribers_subscribed_by FOREIGN KEY (subscribed_by) REFERENCES "users" (user_id) ON DELETE CASCADE');
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "user_subscribers" ADD constraint fk_user_subscribers_subscribed_to FOREIGN KEY (subscribed_to) REFERENCES "users" (user_id) ON DELETE CASCADE');
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "users" ADD column show_gender boolean');
    }).then(() => {
      return queryInterface.sequelize.query('CREATE UNIQUE INDEX IX_UserSubscriber ON user_subscribers (subscribed_by, subscribed_to);');
    });
  },
};
