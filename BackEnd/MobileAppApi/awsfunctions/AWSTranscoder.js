// import node modules..
const AWS = require("aws-sdk");
const path = require('path');
const Logger = require('../helpers/Logger')
const fs = require('fs');
require('dotenv-safe').config()

AWS.config = {
  // accessKeyId: process.env.AWS_ACCESS_KEY,
  // secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.TRANSCODER_REGION,
};

const awsConfig = {
  transcoder: {
    pipelineId: process.env.AWS_PIPELINE_ID,
    playlistFormat: "HLSv3",
    presets: [{ presetId: "1351620000001-200010", suffix: "_1080" }],
    stitch_preset: "1351620000001-000001",
    segmentDuration: "4",
    fileName: "transcoded_video",
  },
};

const uploadVideo = async (file, key) => {
  try {
    let response = await uploadFile(file, key);
    //transcode the video
    await videoTranscoder(response, key);
    let url = key + "/" + awsConfig.transcoder.fileName + ".m3u8";
    let videoData = {
      video_url: response.Location,
      transcoded_video_url: `https://${process.env.AWS_TRANSCODER_BUCKET}.s3.amazonaws.com/${url}`,
    };
    return videoData;
  } catch (err) {
    Logger.error(err);
    throw err;
  }
};

const uploadFile = async (file, key) => {
  try {
    const s3 = new AWS.S3();
    let extenstion = path.extname(file.originalname);
    let outputKey =
      key + "/" + getFileName(file.filename) + "_" + Date.now() + extenstion; //file name
    let params = {
      Bucket: process.env.USER_BUCKET_NAME,
      Key: outputKey,
      ContentType: file.type,
      Body: fs.createReadStream(file.path),
      ACL: "public-read",
    };
    //upload file on s3
    let response = await s3.upload(params).promise();
    fs.unlink(file.path, (err, succ) => {
      console.log("Upload file", err, succ);
    });
    return response;
  } catch (err) {
    Logger.error(err);
    throw err;
  }
};

const videoTranscoder = async (data, prefix) => {
  try {
    let output = awsConfig.transcoder.presets.map((arr) => {
      return {
        Key: `file${arr.suffix}`,
        PresetId: arr.presetId,
        SegmentDuration: awsConfig.transcoder.segmentDuration,
      };
    });
    //playlist for transcoding
    let playList = {
      Name: awsConfig.transcoder.fileName,
      Format: awsConfig.transcoder.playlistFormat,
      OutputKeys: output.map((value) => {
        return value.Key;
      }),
    };
    let params = {
      PipelineId: awsConfig.transcoder.pipelineId,
      Input: {
        Key: data.key || data.Key,
      },
      OutputKeyPrefix: prefix + "/",
      Outputs: output,
      Playlists: [playList],
    };
    const transcoder = new AWS.ElasticTranscoder();
    //create job of transcoding
    let response = transcoder.createJob(params).promise();
    return response;
  } catch (err) {
    Logger.error(err);
    throw err;
  }
};

const getFileName = (params) => {
  const splittedFileName = params.split(".");
  if (splittedFileName && splittedFileName.length > 1) {
    return splittedFileName[0];
  } else return params;
};

module.exports = {
  uploadVideo,
};
