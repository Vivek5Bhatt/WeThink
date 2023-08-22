'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE users ADD COLUMN unique_id VARCHAR(50) DEFAULT NULL`
      )
  },
};

