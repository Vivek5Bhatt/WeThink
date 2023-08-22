'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE users ADD COLUMN subscription VARCHAR(20) DEFAULT NULL`
      )
  },
};

