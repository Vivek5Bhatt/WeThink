'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE user_shared_questions
  ADD COLUMN share_message TEXT`
      )
      .then(() => {
        return queryInterface.sequelize
          .query(
            `DROP TABLE user_friends`
          )
      });
  }
};
