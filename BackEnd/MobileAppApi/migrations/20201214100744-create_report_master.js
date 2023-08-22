'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("report_master",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        created_by: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_report_master ON  "report_master"(name)');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "report_master" ADD constraint fk_report_master_user_id FOREIGN KEY (created_by) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
