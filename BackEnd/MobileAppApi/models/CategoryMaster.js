const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const CategoryMaster = sequelize.define(
  "questions_categories_master",
  {
    category_id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    category_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    prefrence_order: {
      type: Sequelize.INTEGER
    }
  },
  {
    freezeTableName: true,
    onDelete: "cascade",
    timestamps: false,
  }
);

module.exports = CategoryMaster