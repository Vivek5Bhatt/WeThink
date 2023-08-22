'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `alter table request_verification_form drop column working_name`
      ).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "request_verification_form" drop column category_id');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "request_verification_form" add column selfie_url varchar(255)');
      })
  }
};
