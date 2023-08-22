const AWS = require("aws-sdk");
AWS.config = {
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

exports.handler = async (event, context, callback) => {
  try {
    const lambda = new AWS.Lambda({
      region: process.env.LAMBDA_REGION 
    });
    const request = JSON.parse(JSON.stringify(event));
    const key = request.Records[0].s3.object.key;
    const split = key.split('/');
    const userId = split[0];
    const fileUrl = `http://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`;
    const transcodedResponse = await videoTranscoder(
      request.Records[0].s3.object,
      key
    );
    console.log("transcoded response --", transcodedResponse);
    let url = key + "/" + awsConfig.transcoder.fileName + ".m3u8";
    const transcodedVideoUrl = `https://${process.env.AWS_TRANSCODER_BUCKET}.s3.amazonaws.com/${url}`;
    console.log("Video file --", fileUrl);
    console.log("Video transcoded --", transcodedVideoUrl);
    let payloadSuccess = JSON.stringify({
      transcodedVideoUrl:transcodedVideoUrl,
      videoUrl:fileUrl,
      userId:userId
    })
    let payloadFailure = JSON.stringify({
      videoUrl:fileUrl,
      userId:userId,
      transcodedFailure:true
    })
    if (transcodedResponse) {
      return await lambda.invoke({
        FunctionName: process.env.DB_SYNC_LAMBDA_FUNCTION,
        Payload: payloadSuccess // pass params
      }, function(error, data) {
        if (error) {
          console.error(error);
        }
        if(data.Payload){
          console.log("Executed DbSync lambda Success");
        }
      }).promise();
    }else{
      return await lambda.invoke({
        FunctionName: process.env.DB_SYNC_LAMBDA_FUNCTION,
        Payload: payloadFailure // pass params
      }, function(error, data) {
        if (error) {
          console.error(error);
        }
        if(data.Payload){
          console.log("Executed DbSync lambda Failure");
        }
      }).promise();
    }

  } catch (error) {
    console.error(error);
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
    throw err;
  }
};

