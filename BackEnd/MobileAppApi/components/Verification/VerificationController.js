const VerificationService = require('./VerificationServices')
const { ORM_ERRORS, HTTP_CODES, ERROR_MESSSAGES } = require('../../utils/Constants')
const Logger = require('../../helpers/Logger');
const ErrorHandler = require('../../helpers/ErrorHandler');

class VerificationController {
    constructor() {
        this.verificationServicesObj = new VerificationService()
    }

    commonErrorHandler(err) {
        if (err.parent && err.parent.code === ORM_ERRORS.ALREADY_EXISTS && err.fields && err.fields.phone_number) {
            err.statusCode = HTTP_CODES.BAD_REQUEST
            err.errorMessage = ERROR_MESSSAGES.PHONE_ALREADY_EXISTS
        }
        else if (err.parent && err.parent.code === ORM_ERRORS.ALREADY_EXISTS && err.fields && err.fields.email) {
            err.statusCode = HTTP_CODES.BAD_REQUEST
            err.errorMessage = ERROR_MESSSAGES.EMAIL_ALREADY_EXISTS
        }
        else if (err.parent && err.parent.code === ORM_ERRORS.ALREADY_EXISTS && err.fields && err.fields.user_name) {
            err.statusCode = HTTP_CODES.BAD_REQUEST
            err.errorMessage = ERROR_MESSSAGES.USER_NAME_ALREADY_EXISTS
        }
        else {
            return;
        }
    }

    async getVerificationCategoriesController() {
        try {
            return await this.verificationServicesObj.getVerificationCategoriesService();
        } catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getIdentityTypesController() {
        try {
            return await this.verificationServicesObj.getIdentityTypesService();
        } catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async sendVerificationRequest(requestFiles, requestData, userId) {
        try {
            if (requestFiles.photo_id_front[0].mimetype !== 'image/png' && requestFiles.photo_id_front[0].mimetype !== 'image/jpg' && requestFiles.photo_id_front[0].mimetype !== 'image/jpeg' && requestFiles.photo_id_back[0].mimetype !== 'image/png' && requestFiles.photo_id_back[0].mimetype !== 'image/jpg' && requestFiles.photo_id_back[0].mimetype !== 'image/jpeg') {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_IMAGE_FORMAT, HTTP_CODES.BAD_REQUEST)
            } else {
                return await this.verificationServicesObj.sendVerificationRequestService(requestFiles, requestData, userId);
            }
        }
        catch (err) {
            this.commonErrorHandler(err);
            Logger.error(new Error(err))
            throw err;
        }
    }

    async resubmitVerificationRequest(requestFiles, requestData, userId) {
        try {
            if (requestFiles.photo_id_front) {
                if (requestFiles.photo_id_front[0].mimetype !== 'image/png' && requestFiles.photo_id_front[0].mimetype !== 'image/jpg' && requestFiles.photo_id_front[0].mimetype !== 'image/jpeg') {
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_IMAGE_FORMAT, HTTP_CODES.BAD_REQUEST)
                }
            }
            if (requestFiles.photo_id_back) {
                if (requestFiles.photo_id_back[0].mimetype !== 'image/png' && requestFiles.photo_id_back[0].mimetype !== 'image/jpg' && requestFiles.photo_id_back[0].mimetype !== 'image/jpeg') {
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_IMAGE_FORMAT, HTTP_CODES.BAD_REQUEST)
                }
            }
            return await this.verificationServicesObj.resubmitVerificationRequestService(requestFiles, requestData, userId);
        }
        catch (err) {
            this.commonErrorHandler(err);
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getVerificationRequestController(userId) {
        try {
            return await this.verificationServicesObj.getVerificationRequestService(userId);
        } catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }
}

module.exports = VerificationController