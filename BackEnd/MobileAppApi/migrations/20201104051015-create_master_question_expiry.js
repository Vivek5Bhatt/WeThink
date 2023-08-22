'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("question_master_expiry_hours",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        expiry_hours: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }
      })
  }
};
