'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE users ADD COLUMN last_verified_date BIGINT DEFAULT NULL`
      )
  },
};

