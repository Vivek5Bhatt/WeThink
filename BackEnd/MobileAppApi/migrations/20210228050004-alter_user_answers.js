'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE user_answers ADD COLUMN state_symbol varchar(20)`
      ).then(() => {
        return queryInterface.sequelize.query(`ALTER TABLE user_answers ADD COLUMN county varchar(70)`);
      })
  }
};
