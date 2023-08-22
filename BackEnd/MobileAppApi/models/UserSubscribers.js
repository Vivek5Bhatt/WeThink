const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const UserSubscribers = sequelize.define(
  "user_subscribers",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    subscribed_by: {
      type: Sequelize.UUID,
      allowNull: false
    },
    subscribed_to: {
      type: Sequelize.UUID,
      allowNull: false
    },
    created_at: {
      type: Sequelize.BIGINT,
      defautValue: Date.now()
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = UserSubscribers