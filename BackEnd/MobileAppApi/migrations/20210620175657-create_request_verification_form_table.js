'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("request_verification_form",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        user_name: {
          type: Sequelize.STRING(50),
          unique: true
        },
        full_name: {
          type: Sequelize.STRING(100)
        },
        working_name: {
          type: Sequelize.STRING(100)
        },
        phone_number: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        id_type: {
          type: Sequelize.UUID,
          allowNull: false
        },
        category_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        parent_id: {
          type: Sequelize.UUID,
        },
        photo_id_front: {
          type: Sequelize.STRING
        },
        photo_id_back: {
          type: Sequelize.STRING
        },
        status: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        user_comment: {
          type: Sequelize.STRING,
          allowNull: false
        },
        reject_reason: {
          type: Sequelize.STRING
        },
        rejected_by: {
          type: Sequelize.UUID,
          allowNull: true
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.BIGINT,
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "request_verification_form" ADD constraint fk_request_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id) ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "request_verification_form" ADD constraint fk_request_rejected_by FOREIGN KEY (rejected_by) REFERENCES "users" (user_id) ON DELETE CASCADE');
      })
  }
};