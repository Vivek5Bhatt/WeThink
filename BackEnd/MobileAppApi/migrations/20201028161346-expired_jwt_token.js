'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("expired_jwt_tokens",
      {
        expired_jwt_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        token: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "expired_jwt_tokens" ADD constraint fk_jwt_token_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
