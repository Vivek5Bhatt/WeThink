'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `alter table questions_images alter column image_url drop not null`
      )
  }
};
