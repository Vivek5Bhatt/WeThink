'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `ALTER table questions_images ADD COLUMN question_cover_type integer DEFAULT 1`
    )
  }
};
