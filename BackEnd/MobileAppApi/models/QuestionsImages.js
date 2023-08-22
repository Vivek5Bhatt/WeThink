const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const QuestionsImages = sequelize.define(
  "questions_images",
  {
    question_image_id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    question_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    image_url: {
      type: Sequelize.TEXT,
    },
    transcoded_video_url: {
      type: Sequelize.TEXT,
    },
    video_url: {
      type: Sequelize.TEXT,
    },
    video_thumbnail: {
      type: Sequelize.STRING(300),
      defaultValue: null
    },
    ratio: {
      type: Sequelize.STRING
    },
    width: {
      type: Sequelize.INTEGER
    },
    height: {
      type: Sequelize.INTEGER
    },
    question_cover_type: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  },
  {
    freezeTableName: true,
    onDelete: "cascade",
    timestamps: false,
  }
);

module.exports = QuestionsImages