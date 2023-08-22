const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const VerificationCategoryMaster = sequelize.define(
    "verification_category_master",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      preference_order:{
        type:Sequelize.INTEGER
      },
      is_deleted:{
        type:Sequelize.BOOLEAN,
        defaultValue: false
      }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);


module.exports = VerificationCategoryMaster