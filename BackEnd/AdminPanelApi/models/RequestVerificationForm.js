const Sequelize = require("sequelize");
const sequelize = require("../config/connection");
const VerificationCategoryMaster = require("./VerificationCategoryMaster");
const IdentityTypeMaster = require("./IdentityTypeMaster");

const RequestVerificationForm = sequelize.define(
  "request_verification_form",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id',
      }
    },
    user_name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    full_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    working_name: {
      type: Sequelize.STRING(100)
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    phone_number: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    id_type: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'IdentityTypeMaster',
        key: 'id',
      }
    },
    category_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'VerificationCategoryMaster',
        key: 'id'
      }
    },
    parent_id: {
      type: Sequelize.UUID,
    },
    photo_id_front: {
      type: Sequelize.STRING
    },
    photo_id_back: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user_comment: {
      type: Sequelize.STRING,
      allowNull: false
    },
    reject_reason: {
      type: Sequelize.STRING
    },
    rejected_by: {
      type: Sequelize.UUID,
      allowNull: true
    },
    created_at: {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: Date.now()
    },
    updated_at: {
      type: Sequelize.BIGINT,
    },
    reject_reasons: {
      type: Sequelize.JSONB
    },
    selfie_url: {
      type: Sequelize.STRING(255)
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

RequestVerificationForm.belongsTo(VerificationCategoryMaster, { foreignKey: 'category_id' })
RequestVerificationForm.belongsTo(IdentityTypeMaster, { foreignKey: 'id_type' })

module.exports = RequestVerificationForm