'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `ALTER TABLE request_verification_form ADD COLUMN IF NOT EXISTS category_id uuid;`
    ).then(() => {
      return queryInterface.sequelize.query(
        `ALTER TABLE request_verification_form ADD COLUMN IF NOT EXISTS working_name VARCHAR(100);`
      );
    }).then(() => {
      return queryInterface.sequelize.query(
        `ALTER TABLE "request_verification_form" ADD constraint fk_request_category_id FOREIGN KEY (category_id) REFERENCES "verification_category_master" (id) ON DELETE CASCADE;`
      );
    })
  }
};