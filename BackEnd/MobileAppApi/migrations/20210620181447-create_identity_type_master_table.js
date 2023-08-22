'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("identity_type_master",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        identity_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        preference_order: {
          type: Sequelize.INTEGER
        },
        is_deleted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "request_verification_form" ADD constraint fk_request_id_type FOREIGN KEY (id_type) REFERENCES "identity_type_master" (id)');
      })
  }
};