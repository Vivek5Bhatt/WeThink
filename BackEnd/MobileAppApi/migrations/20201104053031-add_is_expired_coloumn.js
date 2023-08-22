'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE questions
    ADD COLUMN is_expired BOOLEAN DEFAULT FALSE`
      )
      .then(() => {
      });
  },
};
