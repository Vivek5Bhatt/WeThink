'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("reported_users_admin_status",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        status:{
          type: Sequelize.INTEGER,
          allowNull: false
        },
        reject_reason:{
          type: Sequelize.STRING
        },
        created_by:{
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: Date.now()
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_users_admin_status" ADD constraint fk_reported_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_users_admin_status" ADD constraint fk_reported_admin_id FOREIGN KEY (created_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};