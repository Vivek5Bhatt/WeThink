"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE users
    ADD COLUMN reset_password_token TEXT`
      )
      .then(() => {
      });
  },
  down: (queryInterface, Sequelize) => {
    // do nothing..
  }
};
