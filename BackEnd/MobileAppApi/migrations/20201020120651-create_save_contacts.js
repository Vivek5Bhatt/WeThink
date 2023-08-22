'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_contacts",
      {
        contact_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        phone_number: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT
        },
        contact_name: {
          type: Sequelize.STRING(70)
        }
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_contacts ON  "user_contacts"(phone_number, user_id)');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_contacts" ADD constraint fk_users_contacts_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
