'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE users ADD COLUMN is_kyc_verified VARCHAR(20) DEFAULT NULL`
      )
  },
};

