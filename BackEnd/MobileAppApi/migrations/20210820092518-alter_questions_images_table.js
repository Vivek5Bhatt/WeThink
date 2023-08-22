'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE questions_images ADD COLUMN video_thumbnail VARCHAR(300) DEFAULT NULL`
      )
  },
};