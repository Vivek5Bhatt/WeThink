'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `ALTER table questions ADD COLUMN duration integer`
    )
  }
};
