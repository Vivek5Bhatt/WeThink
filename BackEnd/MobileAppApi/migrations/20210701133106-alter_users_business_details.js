'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE users ADD COLUMN business_latitude NUMERIC(10,4)`
      ).then(() => {
        return queryInterface.sequelize.query(`ALTER TABLE users ADD COLUMN business_longitude NUMERIC(10,4)`);
      })
  }
};