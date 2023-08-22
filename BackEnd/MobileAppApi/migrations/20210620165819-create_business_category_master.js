'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('business_categories_master', {
      category_id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      preference_order: {
        type: Sequelize.INTEGER
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE "users" ADD constraint fk_users_business_category_id FOREIGN KEY (business_account_category) REFERENCES "business_categories_master" (category_id)');
    })
  }
};
