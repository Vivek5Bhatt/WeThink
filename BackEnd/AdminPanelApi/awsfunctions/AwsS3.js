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
const S3 = new AWS.S3({ params: { Bucket } });

// Function for uploading the file to S3..
const uploadToS3 = (file, key, name, type) => {
    const buffer = fs.createReadStream(file.path);

    return new Promise((resolve, reject) => {
        S3.upload(
            {
                Key: `${key}/${Date.now()}_${name}`,
                ContentType: file.mimetype,
                Body: buffer,
                ACL: "public-read",
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
}


const deleteFromS3 = (key) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: Bucket,
            Key: key
        };
        S3.deleteObject(params, function (err, data) {
            if (err) reject(err); // an error occurred
            else {
                resolve(data); // send successful response
            }
        });
    })

}

module.exports = { uploadToS3, deleteFromS3 }