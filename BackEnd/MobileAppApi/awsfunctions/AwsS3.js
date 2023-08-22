const AWS = require("aws-sdk");
const fs = require("fs");
require("dotenv-safe").config();

AWS.config = {
  // accessKeyId: process.env.AWS_ACCESS_KEY,
  // secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  bucketName: process.env.USER_BUCKET_NAME,
};

const Bucket = process.env.USER_BUCKET_NAME;
const ImageBucket = process.env.IMAGE_BUCKET_NAME;
const DocBucket = process.env.DOCUMENT_BUCKET_NAME

let S3 = new AWS.S3({ params: { Bucket } });

// Function for uploading the file to S3..
const uploadToS3 = (file, key, name, type) => {
  const buffer = fs.createReadStream(file.path);
  let bucket = Bucket;
  if (type === 'image') {
    bucket = ImageBucket
  } else if (type === 'video' || type === 'thumbnail') {
    bucket = Bucket
  } else if (type === 'doc') {
    bucket = DocBucket
  }
  return new Promise((resolve, reject) => {
    S3.upload(
      {
        Key: `${key}/${Date.now()}_${name}`,
        ContentType: file.mimetype,
        Body: buffer,
        ACL: "public-read",
        Bucket: bucket,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          fs.unlinkSync(file.path);
          resolve(data);
        }
      }
    );
  });
};

const deleteFromS3 = (key) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: Bucket,
      Key: key,
    };
    S3.deleteObject(params, function (err, data) {
      if (err) reject(err); // an error occurred
      else {
        resolve(data); // send successful response
      }
    });
  });
};

const uploadDocumentsToS3 = (file, key, name, type) => {
  S3 = new AWS.S3({ params: { DocBucket } });
  const buffer = fs.createReadStream(file.path);
  return new Promise((resolve, reject) => {
    S3.upload(
      {
        Key: `${key}/${Date.now()}_${name}`,
        ContentType: file.mimetype,
        Body: buffer,
        Bucket: DocBucket,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          fs.unlinkSync(file.path);
          resolve(data);
        }
      }
    );
  });
};

// get singed url
const getSignedUrl = async (key) => {
  const s3 = new AWS.S3({
    params: { DocBucket },
    signatureVersion: "v4",
    region: process.env.AWS_REGION,
  });
  const signedUrlExpireSeconds = 36000;
  const url = s3.getSignedUrl("getObject", {
    Bucket: DocBucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
  return url;
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  uploadDocumentsToS3,
  getSignedUrl,
};
