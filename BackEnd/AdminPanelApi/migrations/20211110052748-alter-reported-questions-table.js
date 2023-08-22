'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `ALTER table reported_questions ADD COLUMN user_channel_id varchar(155)`
    ).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "reported_questions" ADD COLUMN group_channel_id varchar(155)');
    })
  },
};
