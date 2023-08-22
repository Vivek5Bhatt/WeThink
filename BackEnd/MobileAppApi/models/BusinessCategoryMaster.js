const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const BusinessCategoryMaster = sequelize.define(
  "business_categories_master",
  {
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
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

module.exports = BusinessCategoryMaster