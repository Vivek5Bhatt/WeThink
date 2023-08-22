"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE report_master ADD COLUMN is_deleted BOOLEAN DEFAULT false`
      )
  },
};