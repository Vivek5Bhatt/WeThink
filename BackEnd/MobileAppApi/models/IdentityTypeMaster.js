const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const IdentityTypeMaster = sequelize.define(
  "identity_type_master",
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
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = IdentityTypeMaster