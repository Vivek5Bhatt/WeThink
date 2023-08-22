'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'alter table notifications add column request_form_id uuid'
    ).then(() => {
      return queryInterface.sequelize.query(
        'alter table notifications add column reject_reason varchar(255)'
      )
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "notifications" ADD constraint fk_notification_request_id FOREIGN KEY (request_form_id) REFERENCES "request_verification_form" (id)  ON DELETE CASCADE');
    })
  }
};