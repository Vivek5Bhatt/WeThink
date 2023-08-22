const VerificationRepository = require('./VerificationRepository')
const { v4: uuidv4 } = require("uuid");
const { HTTP_CODES, ERROR_MESSSAGES, VERIFICATION_REQUEST_STATUS } = require('../../utils/Constants')
const { getDifferenceInDays } = require('../../utils/CommonFunctions');
const ErrorHandler = require('../../helpers/ErrorHandler');
const Logger = require('../../helpers/Logger');
const AwsS3Functions = require('../../awsfunctions');

class VerificationServices {
    constructor() {
        this.VerificationRepositoryObj = new VerificationRepository()
    }

    async getVerificationCategoriesService() {
        try {
            return await this.VerificationRepositoryObj.getVerificationCategories();
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getIdentityTypesService() {
        try {
            return await this.VerificationRepositoryObj.getIdentityTypes();
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async sendVerificationRequestService(requestFiles, requestData, userId) {
        let frontPicture = "";
        let backPicture = "";
        try {
            let verificationData = await this.VerificationRepositoryObj.getVerificationData(userId);
            if (verificationData) {
                let differenceInTime = Date.now() - verificationData.updated_at
                let differenceInDays = getDifferenceInDays(differenceInTime);
                if (differenceInDays.toFixed(0) - 1 < 30) {
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.VERIFICATION_REQUEST_NOT_ALLOWED, HTTP_CODES.BAD_REQUEST);
                }
            } else {
                requestData.updated_at = Date.now();
                requestData.id = uuidv4();
                requestData.user_id = userId;
                requestData.status = VERIFICATION_REQUEST_STATUS.PENDING;
                if (requestFiles) {
                    frontPicture = (await this.uploadDocumentService(requestFiles.photo_id_front[0])).image_url;
                    backPicture = (await this.uploadDocumentService(requestFiles.photo_id_back[0])).image_url;
                }
                requestData.photo_id_front = frontPicture;
                requestData.photo_id_back = backPicture;
                if (requestData.category_id === '')
                    delete requestData.category_id;
                return await this.VerificationRepositoryObj.createVerificationRequest(requestData);
            }
        } catch (error) {
            if (frontPicture) {
                AwsS3Functions.deleteFromS3(frontPicture);
            }
            if (backPicture) {
                AwsS3Functions.deleteFromS3(backPicture);
            }
            Logger.error(new Error(error))
            throw error;
        }
    }

    async uploadDocumentService(requestData, folderName = `documents`) {
        try {
            const imageUrl = await AwsS3Functions.uploadDocumentsToS3(requestData, folderName, requestData.filename)
            return { image_url: imageUrl.key, video_url: null, transcoded_video_url: null, width: requestData.width || null, height: requestData.height, ratio: requestData.ratio }
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getVerificationRequestService(userId) {
        try {
            let result = await this.VerificationRepositoryObj.getVerificationRequestDetails(userId);
            if (result) {
                const differenceInTime = Date.now() - result.updated_at
                let differenceInDays = getDifferenceInDays(differenceInTime);
                differenceInDays = differenceInDays - 1;
                if (differenceInDays.toFixed(0) >= 30) {
                    differenceInDays = 30
                }
                if (differenceInDays.toFixed(0) >= 30) {
                    result.setDataValue('resubmit', true)
                    result.setDataValue('days_left', 30 - differenceInDays.toFixed(0))
                } else {
                    result.setDataValue('resubmit', false)
                    result.setDataValue('days_left', 30 - Math.abs(differenceInDays.toFixed(0)))
                }
            }
            return result;
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async resubmitVerificationRequestService(requestFiles, requestData, userId) {
        try {
            var frontPicture = "";
            var backPicture = "";
            const verificationData = await this.VerificationRepositoryObj.getVerificationData(userId);
            if (verificationData) {
                let differenceInTime = Date.now() - verificationData.updated_at
                let differenceInDays = getDifferenceInDays(differenceInTime);
                if (differenceInDays.toFixed(0) < 30) {
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.VERIFICATION_REQUEST_NOT_ALLOWED, HTTP_CODES.BAD_REQUEST);
                }
                else {
                    requestData.updated_at = Date.now();
                    requestData.status = VERIFICATION_REQUEST_STATUS.RESUBMIT;
                    if (requestFiles.photo_id_front) {
                        if (verificationData.photo_id_front) {
                            const frontExistingPicture = verificationData.photo_id_front.replace(bucketUrl);
                            AwsS3Functions.deleteFromS3(frontExistingPicture);
                        }
                        frontPicture = (await this.uploadDocumentService(requestFiles.photo_id_front[0])).image_url;
                        requestData.photo_id_front = frontPicture;
                    }
                    if (requestFiles.photo_id_back) {
                        if (verificationData.photo_id_back) {
                            const backExistingPicture = verificationData.photo_id_back.replace(bucketUrl);
                            AwsS3Functions.deleteFromS3(backExistingPicture);
                        }
                        backPicture = (await this.uploadDocumentService(requestFiles.photo_id_back[0])).image_url;
                        requestData.photo_id_back = backPicture;
                    }
                    await this.VerificationRepositoryObj.resubmitVerificationRequest(requestData, verificationData.id);
                    return await this.getVerificationRequestService(userId);
                }
            } else {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.VERIFICATION_REQUEST_NOT_FOUND, HTTP_CODES.BAD_REQUEST);
            }
        } catch (error) {
            if (frontPicture) {
                AwsS3Functions.deleteFromS3(frontPicture);
            }
            if (backPicture) {
                AwsS3Functions.deleteFromS3(backPicture);
            }
            Logger.error(new Error(error))
            throw error;
        }
    }
}

module.exports = VerificationServices