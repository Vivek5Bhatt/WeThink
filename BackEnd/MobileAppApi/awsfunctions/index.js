const { uploadToS3, deleteFromS3, uploadDocumentsToS3 } = require('./AwsS3')
const { uploadVideo } = require('./AWSTranscoder')
const { invokeStepFunctions } = require('./AWSStepFunctions');

module.exports = {
    uploadToS3,
    deleteFromS3,
    uploadVideo,
    uploadDocumentsToS3,
    invokeStepFunctions
}