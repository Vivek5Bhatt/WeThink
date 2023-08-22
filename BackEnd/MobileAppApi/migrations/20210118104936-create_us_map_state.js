'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("answer_audit",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        state_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        state_code: {
          type: Sequelize.STRING,
          allowNull: true
        },
        state_data: {
          type: Sequelize.JSONB,
          allowNull: true
        }
      })
  }
};
