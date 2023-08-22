'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE users
  ADD COLUMN title varchar(100)`
      )
      .then(() => {
      });
  },
};
