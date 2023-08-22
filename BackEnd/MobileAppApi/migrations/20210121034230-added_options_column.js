'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE answer_audit ADD COLUMN options JSONB`
      )
  }
};
