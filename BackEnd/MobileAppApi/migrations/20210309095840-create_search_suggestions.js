'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("search_suggestions",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        searched_user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "search_suggestions" ADD constraint fk_searched_by_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "search_suggestions" ADD constraint fk_searched_user_id FOREIGN KEY (searched_user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_search_suggestions ON  "search_suggestions"( user_id, searched_user_id)');
      })
  }
};



