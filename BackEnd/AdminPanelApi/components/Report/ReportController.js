const ReportService = require('./ReportServices')
const { ORM_ERRORS, HTTP_CODES, ERROR_MESSSAGES, SIGNUP_TYPE, LOGIN_TYPE, REPLY_TYPE } = require('../../utils/Constants')
const ErrorHandler = require('../../helpers/ErrorHandler')
const Logger = require('../../helpers/Logger')
const { checkImageSize } = require('../../utils/CommonFunctions')

class QuestionContoller {
    constructor() {
        this.ReportServiceObj = new ReportService()
    }

    async addToReportMasterController(requestData, userId) {
        try {
            return await this.ReportServiceObj.addToReportMasterService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async getAllReportMasterController(requestData) {
        try {
            return await this.ReportServiceObj.getAllMasterService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async deleteReportMasterController(requestData) {
        try {
            const data = await this.ReportServiceObj.deleteReportMasterService(requestData);
            if (data)
                return;
            else
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_REPORT_MASTER_ID, HTTP_CODES.BAD_REQUEST);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async getReportedCommentListController(requestData, userId) {
        try {
            return await this.ReportServiceObj.getReportedCommentService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async updateReportStatusController(requestData, userId) {
        try {
            return await this.ReportServiceObj.updateReportedCommentStatusService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async updateReportMasterController(requestData) {
        try {
            return await this.ReportServiceObj.updateReportMasterService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async getReportedCommentController(requestData) {
        try {
            return await this.ReportServiceObj.getReportedCommentDetailsService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async getReportedQuestionListController(requestData) {
        try {
            return await this.ReportServiceObj.getReportedQuestionService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async getReportedQuestionController(requestData) {
        try {
            return await this.ReportServiceObj.getReportedQuestionDetailsService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async updateReportQuestionStatusController(requestData, userId) {
        try {
            return await this.ReportServiceObj.updateReportQuestionStatusService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async getReportedUserListController(requestData) {
        try {
            return await this.ReportServiceObj.getReportedUsersService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async getReporteduserController(requestData) {
        try {
            return await this.ReportServiceObj.getReportedUserDetailService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async reportActionController(requestData) {
        try {
            return await this.ReportServiceObj.reportActionService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }

    async reportReplyController(requestData, adminId) {
        try {
            if (!requestData.reported_user_id && !requestData.reported_question_id)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.PROVIDE_QUESTION_ID_OR_USER_ID, HTTP_CODES.BAD_REQUEST);
            else if (+requestData.type === REPLY_TYPE.SINGLE_REPLY && !requestData.replied_to_user_id)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_USER_ID, HTTP_CODES.BAD_REQUEST);
            return await this.ReportServiceObj.saveReportReplyService(requestData, adminId);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err
        }
    }
}


module.exports = QuestionContoller
