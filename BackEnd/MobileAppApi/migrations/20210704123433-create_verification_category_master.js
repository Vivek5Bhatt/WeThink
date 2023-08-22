'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("verification_category_master",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        name: {
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
        return queryInterface.sequelize.query('ALTER TABLE "request_verification_form" ADD constraint fk_request_category FOREIGN KEY (category_id) REFERENCES "verification_category_master" (id)');
      })
  }
};