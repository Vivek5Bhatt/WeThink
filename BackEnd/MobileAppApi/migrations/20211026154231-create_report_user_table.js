'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("reported_users",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        reported_by: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        reported_to: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        report_reason_id: {
          type: Sequelize.UUID
        },
        other_reason: {
          type: Sequelize.STRING
        },
        updated_at: {
          type: Sequelize.BIGINT
        },
        report_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_users" ADD constraint fk_post_report_by FOREIGN KEY (reported_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_users" ADD constraint fk_post_report_to FOREIGN KEY (reported_to) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "reported_users" ADD constraint fk_post_reason_id FOREIGN KEY (report_reason_id) REFERENCES "report_master" (id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_report_user ON  "reported_users"(reported_by, reported_to)');
      })
  }
};
