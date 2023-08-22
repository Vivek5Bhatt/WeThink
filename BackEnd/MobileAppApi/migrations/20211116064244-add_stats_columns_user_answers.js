'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `ALTER TABLE user_answers ADD COLUMN gender integer`
    ).then(() => {
      return queryInterface.sequelize.query(
        `ALTER table user_answers ADD COLUMN state varchar(155)`
      );
    })
  }
};