'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("us_state_county_master",
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
