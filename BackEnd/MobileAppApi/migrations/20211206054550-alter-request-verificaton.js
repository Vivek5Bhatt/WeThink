'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `alter table request_verification_form alter column user_comment drop not null`
      )
  }
};