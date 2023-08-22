
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `DROP INDEX idx_report_master;`
      )
  }
};
