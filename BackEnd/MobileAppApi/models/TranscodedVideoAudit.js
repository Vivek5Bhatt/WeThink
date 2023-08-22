const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

const TranscodedVideoAudit = sequelize.define(
    "transcoded_videos_audit",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        video_url: {
            type: Sequelize.STRING(500),
            allowNull: false,
        },
        transcoded_video_url: {
            type: Sequelize.STRING(500),
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        onDelete: "cascade",
        timestamps: false,
    }
);

module.exports = TranscodedVideoAudit