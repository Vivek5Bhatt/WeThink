'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `ALTER TABLE questions DROP COLUMN IF EXISTS duration`
    ).then(() => {
      return queryInterface.sequelize.query(
        `ALTER table questions ADD COLUMN answer_duration integer`
      );
    }).then(() => {
      return queryInterface.sequelize.query(
        `ALTER table questions ADD COLUMN answer_expiry_time bigint`
      );
    })
  }
};