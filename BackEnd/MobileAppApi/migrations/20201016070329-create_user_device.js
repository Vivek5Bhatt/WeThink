'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_devices",
      {
        user_device_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        device_token: {
          type: Sequelize.STRING,
          allowNull: false
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        sns_arn_endpoint: {
          type: Sequelize.TEXT
        },
        subscriber_arn_endpoint: {
          type: Sequelize.TEXT
        },
        device_type: {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_devices ON  "user_devices"(device_token, user_id)');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_devices" ADD constraint fk_users_device_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
