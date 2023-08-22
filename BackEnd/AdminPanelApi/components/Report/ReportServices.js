const ReportRepository = require('./ReportRepository')
const { v4: uuidv4 } = require("uuid");
const Logger = require('../../helpers/Logger');
const ErrorHandler = require('../../helpers/ErrorHandler');
const { ERROR_MESSSAGES, HTTP_CODES, REPORT_STATUS, REPLY_TYPE } = require('../../utils/Constants');
const { sendNotiticationOnAcceptReportedComments, sendNotiticationOnRejectReportedComments } = require('../Report/NotificationServices')
class ReportServices {
    constructor() {
        this.ReportRepositoryObj = new ReportRepository()
    }
    async addToReportMasterService(requestData, userId) {
        try {
            const data = await this.ReportRepositoryObj.checkIFNameExists(requestData);
            if (data && data.length)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.REPORT_REASON_EXISTS, HTTP_CODES.BAD_REQUEST)
            return await this.ReportRepositoryObj.addReportMaster({ id: uuidv4(), created_at: Date.now(), created_by: userId, name: requestData.name, type: requestData.type });

        }
        catch (err) {
            Logger.error(new Error(err))

            throw err;
        }
    }

    async getAllMasterService(requestData) {
        try {
            const data = await this.ReportRepositoryObj.getReportMasterList(requestData);
            if (data && data.length) {
                return {
                    total_count: data[0].total_count,
                    data: data
                }
            }
            else {
                return { total_count: 0, data: [] }
            }
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async deleteReportMasterService(requestData) {
        try {
            return await this.ReportRepositoryObj.deleteReportMaster(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedCommentService(requestData, userId) {
        try {
            const data = await this.ReportRepositoryObj.getReportedCommentList(requestData);
            if (data && data.length) {
                return {
                    total_count: data[0].total_count,
                    data: data
                }
            }
            else {
                return { total_count: 0, data: [] }
            }
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async updateReportedCommentStatusService(requestData, userId) {
        try {
            const updateData = await this.ReportRepositoryObj.updateReportStatus(requestData);
            if (updateData && updateData.length && updateData[0][0]) {
                if (Number(requestData.report_status) === REPORT_STATUS.ACCEPTED) {
                    await this.ReportRepositoryObj.updateReportedCommentStatus(requestData);
                    // sendNotiticationOnAcceptReportedComments(requestData.id)
                }
                else if (Number(requestData.report_status) === REPORT_STATUS.REJECTED) {
                    // sendNotiticationOnRejectReportedComments(requestData.id)
                }
                return updateData[0][0];
            }
            else {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.UNABLE_TO_UPDATE_STATUS, HTTP_CODES.BAD_REQUEST);
            }
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async updateReportMasterService(requestData) {
        try {
            return await this.ReportRepositoryObj.updateReportMaster(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedCommentDetailsService(requestData) {
        try {
            const [questionData, questionAnswerData] = await Promise.all([this.ReportRepositoryObj.getQuestionDetails(requestData), this.ReportRepositoryObj.getQuestionOptionDetails(requestData)]);
            if (!questionData.length || !questionAnswerData.length)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_QUESTION_ID, HTTP_CODES.BAD_REQUEST);
            return { question_data: questionData[0], options: questionAnswerData };
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedQuestionService(requestData) {
        try {
            const data = await this.ReportRepositoryObj.getReportedQuestionList(requestData);
            if (data && data.length) {
                return {
                    total_count: data[0].total_count,
                    data: data
                }
            }
            else {
                return { total_count: 0, data: [] }
            }
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedQuestionDetailsService(requestData) {
        try {
            const [questionData, questionAnswerData, questionUserData, questionAdminStatus] = await Promise.all([this.ReportRepositoryObj.getReportQuestionDetails(requestData), this.ReportRepositoryObj.getReportQuestionOptionDetails(requestData), this.ReportRepositoryObj.getReportQuestionUserDetails(requestData), this.ReportRepositoryObj.getReportQuestionAdminStatus(requestData)]);
            if (!questionData.length || !questionAnswerData.length) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_QUESTION_ID, HTTP_CODES.BAD_REQUEST);
            }
            const replyAllMessage = [];
            if (questionUserData && questionUserData.length) {
                if (questionUserData[0].type && +questionUserData[0].type === REPLY_TYPE.REPLY_ALL) {
                    questionUserData.forEach(element => {
                        if (element.type && element.reply_message)
                            element.is_replied = true;
                        else
                            element.is_replied = false;
                        replyAllMessage.push(element)
                    });
                }

            }
            return { question_data: questionData[0], userData: questionUserData, options: questionAnswerData, rejected_reasons: questionAdminStatus, replied_all_message: replyAllMessage };
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async updateReportQuestionStatusService(requestData, userId) {
        try {
            const updateData = await this.ReportRepositoryObj.updateQuestionReportStatus(requestData);
            if (updateData && updateData.length && updateData[0][0]) {
                if (Number(requestData.report_status) === REPORT_STATUS.ACCEPTED) {
                    await this.ReportRepositoryObj.updateReportedQuestionStatus(requestData);
                    requestData.is_accepted = true;
                    await this.ReportRepositoryObj.addReportedQuestionAdminStatus(requestData, userId);
                }
                else if (Number(requestData.report_status) === REPORT_STATUS.REJECTED) {
                    requestData.is_accepted = false;
                    await this.ReportRepositoryObj.addReportedQuestionAdminStatus(requestData, userId);
                }
                return updateData[0][0];
            }
            else {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.UNABLE_TO_UPDATE_STATUS, HTTP_CODES.BAD_REQUEST);
            }
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedUsersService(requestData) {
        try {
            const data = await this.ReportRepositoryObj.getReportedusersList(requestData);
            if (data && data.length) {
                return {
                    total_count: data[0].total_count,
                    data: data
                }
            }
            else {
                return { total_count: 0, data: [] }
            }
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedUserDetailService(requestData) {
        try {
            const [reportedData, reportUserData, rejectReasons] = await Promise.all([this.ReportRepositoryObj.getReportedUserDetails(requestData), this.ReportRepositoryObj.getReportByUserDetails(requestData), this.ReportRepositoryObj.getReportUserAdminStatus(requestData)]);
            const replyAllMessage = [];
            if (reportUserData && reportUserData.length) {
                if (reportUserData[0].type && +reportUserData[0].type === REPLY_TYPE.REPLY_ALL) {
                    reportUserData.forEach(element => {
                        if (element.type && element.reply_message)
                            element.is_replied = true;
                        else
                            element.is_replied = false;
                        replyAllMessage.push(element)
                    });
                }
            }
            return { reported_data: reportedData, users_data: reportUserData, rejected_reasons: rejectReasons, replied_all_message: replyAllMessage };
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }


    async reportActionService(requestData) {
        try {
            return await this.ReportRepositoryObj.reportedUserActionRepository(requestData);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }


    async saveReportReplyService(requestData, adminId) {
        try {
            return await this.ReportRepositoryObj.saveReportAdminReplyRepository(requestData, adminId);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }
}


module.exports = ReportServices