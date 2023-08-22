"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "question_search_suggestions", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      search: {
        type: Sequelize.Sequelize.STRING(255),
        allowNull: false,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "question_search_suggestions" ADD constraint fk_question_search_suggestions_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id) ON DELETE CASCADE');
    });
  },
};
