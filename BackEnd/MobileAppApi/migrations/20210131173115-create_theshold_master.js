'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("threshold_master",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        threshold_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        type: {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      })
  }
};
