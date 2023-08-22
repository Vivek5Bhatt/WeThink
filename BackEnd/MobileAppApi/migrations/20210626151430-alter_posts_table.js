'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'alter table questions add column average_rating NUMERIC(2,1)'
    ).then(() => {
      return queryInterface.sequelize.query(
        'alter table question_options add column start_rating NUMERIC(2,1)'
      )
    }).then(() => {
      return queryInterface.sequelize.query(
        'alter table user_answers add column rating NUMERIC(2,1)'
      );
    })
  }
};