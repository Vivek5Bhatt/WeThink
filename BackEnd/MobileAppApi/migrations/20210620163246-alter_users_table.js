'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'alter table users add column parent_id uuid'
    ).then(() => {
      return queryInterface.sequelize.query(
        'alter table users add column is_business_account BOOLEAN DEFAULT FALSE'
      )
    }).then(() => {
      return queryInterface.sequelize.query(
        'alter table users add column business_account_name varchar(255)'
      )
    }).then(() => {
      return queryInterface.sequelize.query(
        'alter table users add column business_account_category uuid'
      )
    }).then(() => {
      return queryInterface.sequelize.query(
        'alter table users add column is_suggestion_skipped BOOLEAN DEFAULT FALSE'
      )
    }).then(() => {
      return queryInterface.sequelize.query(
        'alter table users add column is_officially_verified BOOLEAN DEFAULT FALSE'
      )
    })
  }
};