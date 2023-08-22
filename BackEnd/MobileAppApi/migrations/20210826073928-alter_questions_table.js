"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE questions ADD COLUMN video_status INTEGER DEFAULT NULL`
      )
      .then(() => {
        return queryInterface.sequelize.query(
          `ALTER TABLE request_verification_form
          ADD COLUMN IF NOT EXISTS reject_reasons jsonb;`
        );
      }).then(() => {
        return queryInterface.sequelize.query(
          `ALTER TABLE questions ADD COLUMN is_elastic_data_added BOOLEAN DEFAULT false;`
        );
      });
  },
};
