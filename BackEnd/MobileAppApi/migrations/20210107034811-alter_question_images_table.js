'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE questions_images ADD COLUMN width integer`
      )
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE questions_images ADD COLUMN height integer');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE questions_images ADD COLUMN ratio varchar(255)');
      })
  }
};
