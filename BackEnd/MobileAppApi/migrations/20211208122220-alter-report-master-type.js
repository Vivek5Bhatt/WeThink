'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `alter table "report_master" add column "type" integer default 1`
      )
  }
};
