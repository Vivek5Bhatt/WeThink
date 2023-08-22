'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("question_type_master",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
      })
  }
};