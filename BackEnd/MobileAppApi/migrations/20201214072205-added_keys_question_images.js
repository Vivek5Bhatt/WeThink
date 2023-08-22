'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE questions_images ADD COLUMN transcoded_video_url TEXT`
      )
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE questions_images ADD COLUMN video_url TEXT');
      })
  }
};
