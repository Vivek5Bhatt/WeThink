const AWS = require("aws-sdk");

const BUCKET_NAME = process.env.DOCUMENT_BUCKET_NAME;

// const credentials = {
   // accessKeyId: process.env.AWS_ACCESS_KEY,
   // secretAccessKey: process.env.AWS_SECRET_KEY,
// };

// AWS.config.update({ credentials: credentials, region: process.env.AWS_REGION });
AWS.config.update({ region: process.env.AWS_REGION });

const s3 = new AWS.S3()

const getSignedUrl = async (key) => {
  const signedUrlExpireSeconds = 36000;
  const url = s3.getSignedUrl("getObject", {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
  return url;
};

module.exports = getSignedUrl;