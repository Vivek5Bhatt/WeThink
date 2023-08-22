'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("trending_threshold_master",
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
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "questions" ADD COLUMN is_trending BOOLEAN default false');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "questions" ADD COLUMN trending_date BIGINT');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "question_expiration" ADD COLUMN expiration_type INTEGER');
      })
  }
};
