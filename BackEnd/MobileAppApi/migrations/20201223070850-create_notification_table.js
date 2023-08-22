'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("notifications",
      {
        notification_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        sender_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        receiver_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        type: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        event_id: {
          type: Sequelize.UUID
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        seen: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        is_deleted: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "notifications" ADD constraint fk_sender_id FOREIGN KEY (sender_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "notifications" ADD constraint fk_receiver_id FOREIGN KEY (receiver_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
