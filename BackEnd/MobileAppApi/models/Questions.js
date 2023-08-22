const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const Questions = sequelize.define(
  "questions",
  {
    question_id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    created_by: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    question_date: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    created_at: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    updated_by: {
      type: Sequelize.UUID,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    question_title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    question_type: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    question_uuid: {
      type: Sequelize.UUID,
      unique: true
    },
    is_commenting_enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    deleted_at: {
      type: Sequelize.BIGINT
    },
    updated_at: {
      type: Sequelize.BIGINT
    },
    is_expired: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    is_trending: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    trending_date: {
      type: Sequelize.BIGINT
    },
    average_rating: {
      type: Sequelize.NUMERIC(2, 1)
    },
    video_status: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    is_elastic_data_added: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    answer_duration: {
      type: Sequelize.INTEGER
    },
    answer_expiry_time: {
      type: Sequelize.BIGINT
    }
  },
  {
    onDelete: "cascade",
    timestamps: false,
  }
);

module.exports = Questions