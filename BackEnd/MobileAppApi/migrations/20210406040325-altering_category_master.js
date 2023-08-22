'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE questions_categories_master ADD COLUMN prefrence_order integer`
      )
  }
};
