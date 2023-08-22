const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const SilentPushAudit = sequelize.define(
  "silent_push_audit",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    question_id: {
      type: Sequelize.UUID,
      allowNull: true
    },
    question_shared_id: {
      type: Sequelize.UUID,
      allowNull: true
    }
  },
  {
    freezeTableName: true,
    onDelete: "cascade",
    timestamps: false,
  }
);

module.exports = SilentPushAudit