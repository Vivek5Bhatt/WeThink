'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE users ADD COLUMN last_timestamp_notifications_read BIGINT DEFAULT NULL`
      )
  },
};

