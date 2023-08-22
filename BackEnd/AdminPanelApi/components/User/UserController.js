const UserService = require('./UserServices')
const { ORM_ERRORS, HTTP_CODES, ERROR_MESSSAGES, SIGNUP_TYPE, LOGIN_TYPE } = require('../../utils/Constants')
const ErrorHandler = require('../../helpers/ErrorHandler')
const Logger = require('../../helpers/Logger')
const { checkImageSize, checkValidUUID } = require('../../utils/CommonFunctions')
const Constants = require('../../utils/Constants')

class UserController {
    constructor() {
        this.userServiceObj = new UserService()
    }

    async updateProfileData(requestData) {
        try {
            return await this.userServiceObj.updateProfileOnSignupService(requestData)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async login(requestData) {
        try {
            return await this.userServiceObj.loginService(requestData)
        }
        catch (err) {
            if (err.parent && err.parent.code === ORM_ERRORS.ALREADY_EXISTS && err.fields && err.fields.device_token) {
                err.statusCode = HTTP_CODES.BAD_REQUEST
                err.errorMessage = ERROR_MESSSAGES.DEVICE_ALREADY_EXISTS
            }
            Logger.error(new Error(err))
            throw err;
        }
    }

    async addQuestionController(requestData, imageData, userId) {
        try {
            if (requestData.question_type == Constants.QUESTION_TYPE.MCQ) {
                if (!requestData.options || !requestData.options.length) {
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_OPTIONS_FIELD, HTTP_CODES.BAD_REQUEST)
                }
                requestData.options = typeof requestData.options === 'string' ? JSON.parse(requestData.options) : requestData.options;
                for (let x of requestData.options) {
                    if (!x.name || !x.option)
                        throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_OPTIONS_VALUE, HTTP_CODES.BAD_REQUEST)
                }
            }
            if (!requestData.toUpdate)
                requestData.image_url = await this.uploadPhotoController(imageData);
            if (requestData.toUpdate) {
                if (!requestData.question_id)
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_QUESTION_ID, HTTP_CODES.BAD_REQUEST)
                else if (!imageData && !requestData.image_url)
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_IMAGE, HTTP_CODES.BAD_REQUEST)
                else if (imageData && imageData.filename)
                    requestData.image_url = await this.uploadPhotoController(imageData);
                return await this.userServiceObj.updateQuestionService(requestData, userId)
            }
            else
                return this.userServiceObj.addQuestionService(requestData, userId)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getCategoryMasterController() {
        try {
            return this.userServiceObj.getCategoryService()
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async uploadPhotoController(requestData) {
        try {
            if (!requestData)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_IMAGE, HTTP_CODES.BAD_REQUEST)
            if (requestData.mimetype !== 'image/png' && requestData.mimetype !== 'image/jpg' && requestData.mimetype !== 'image/jpeg')
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_IMAGE_FORMAT, HTTP_CODES.BAD_REQUEST)
            else if (!checkImageSize(requestData, 5))
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MAXIMUM_FILE_SIZE, HTTP_CODES.BAD_REQUEST)
            return this.userServiceObj.uploadImageService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getQuestionsOnCategoryController(requestData, userId) {
        try {
            const data = await this.userServiceObj.getQuestionOnHomeService(requestData, userId)
            const responseData = {}
            if (data.length) {
                responseData.data = data;
                responseData.total_count = data[0].total_count || 0
            }
            else {
                responseData.data = []
                responseData.total_count = 0
            }
            return responseData
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async testAPi() {
        return this.userServiceObj.getInfo()
    }

    async forgotPasswordController(requestData) {
        try {
            return await this.userServiceObj.forgotPasswordService(requestData)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async updatePasswordController(requestData) {
        try {
            return await this.userServiceObj.resetPasswordService(requestData)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async logoutController(userId, token) {
        try {
            return await this.userServiceObj.logoutService(userId, token)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async deleteQuestionController(requestData, userId) {
        try {
            return await this.userServiceObj.removeQuestionService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async verifyEmailController(requestData) {
        try {
            return await this.userServiceObj.verifyEmailService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getQuestionDetailController(requestData) {
        try {
            return await this.userServiceObj.getQuestionDetailsService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getSubmissionListController(requestData) {
        try {
            const data = await this.userServiceObj.getSubmissionListService(requestData)
            const responseData = {}
            if (data.length) {
                responseData.data = data;
                responseData.total_count = data[0].total_count || 0
            }
            else {
                responseData.data = []
                responseData.total_count = 0
            }
            return responseData
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getUserDetailsController(requestData) {
        try {
            return await this.userServiceObj.getUserDetailService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getUserVerificationFormDetailsController(requestData) {
        try {
            return await this.userServiceObj.getUserVerificationFormDetailService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async profileActionController(requestData, userId) {
        try {
            return await this.userServiceObj.profileActionService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async deleteSuspendController(requestData) {
        try {
            if (requestData.user_id && !checkValidUUID(requestData.user_id))
                throw new ErrorHandler().customError(
                    ERROR_MESSSAGES.INVALID_USER_ID,
                    HTTP_CODES.BAD_REQUEST
                );
            return await this.userServiceObj.deleteSuspendService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getUserListController(requestData) {
        try {
            return await this.userServiceObj.getUserListService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }
    async getVerificationFormListController(requestData) {
        try {
            return await this.userServiceObj.getVerificationFormListService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }
}

module.exports = UserController