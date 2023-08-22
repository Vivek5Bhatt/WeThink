'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'alter table questions add column deleted_at bigint'
    )
      .then(() => {
        return queryInterface.sequelize.query(
          'alter table questions add column updated_at bigint'
        )
      }).
      then(() => {
        return queryInterface.sequelize.query(
          'alter table question_options add column option_number integer'
        )
      }).then(() => {
        return queryInterface.sequelize.query(
          'alter table question_options ADD CONSTRAINT option_value_check CHECK(option_number>0)'
        )
      })
  }
};
