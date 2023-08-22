'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("transcoded_videos_audit",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        video_url: {
          type: Sequelize.STRING(500),
          allowNull: false
        },
        transcoded_video_url: {
          type: Sequelize.STRING(500),
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT
        }
      })
  }
};
