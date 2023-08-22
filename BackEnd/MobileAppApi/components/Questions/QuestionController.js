const QuestionService = require('./QuestionServices')
const { ORM_ERRORS, HTTP_CODES, ERROR_MESSSAGES, LIKE_TYPE } = require('../../utils/Constants')
const ErrorHandler = require('../../helpers/ErrorHandler')
const Logger = require('../../helpers/Logger')
const { checkValidUUID } = require('../../utils/CommonFunctions')

class QuestionController {
    constructor() {
        this.QuestionServiceObj = new QuestionService()
    }

    async enableDisableCommentController(requestData, userId) {
        try {
            if (requestData.id && !checkValidUUID(requestData.id))
                throw new ErrorHandler().customError(
                    ERROR_MESSSAGES.INVALID_QUESTION_ID,
                    HTTP_CODES.BAD_REQUEST
                );
            return await this.QuestionServiceObj.enableDisableCommentService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async createCommentController(requestData, userId) {
        try {
            if (requestData.question_id && !checkValidUUID(requestData.question_id))
                throw new ErrorHandler().customError(
                    ERROR_MESSSAGES.INVALID_QUESTION_ID,
                    HTTP_CODES.BAD_REQUEST
                );
            if (requestData.user_mentions && requestData.user_mentions.length) {
                requestData.user_mentions = [...new Set(requestData.user_mentions)];
                if (requestData.user_mentions.length > 5)
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.MAXIMUM_USERS_ALLOWED_MENTIONS, HTTP_CODES.BAD_REQUEST);
            }
            return await this.QuestionServiceObj.createCommentService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getCommentListController(requestData, userId) {
        try {
            if ((requestData.comment_id && requestData.reply_comment_id) || requestData.comment_id) {
                return await this.QuestionServiceObj.getFilteredCommentListService(requestData, userId);
            }
            else
                return await this.QuestionServiceObj.getCommentListService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getReplyCommentListController(requestData, userId) {
        try {
            if (requestData.reply_comment_id && requestData.scroll_type)
                return await this.QuestionServiceObj.getFilteredReplyCommentListService(requestData, userId);
            else
                return await this.QuestionServiceObj.getReplyCommentListService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async mentionUsersController(requestData, userId) {
        try {
            if (requestData.search && !requestData.search.trim())
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_SEARCH_FIELD, HTTP_CODES.BAD_REQUEST);
            if (requestData.search && requestData.search.length > 20)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MAXIMUM_LENGTH_FIELD, HTTP_CODES.BAD_REQUEST);
            return await this.QuestionServiceObj.mentionUsersServices(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async deleteCommentController(requestData, userId) {
        try {
            return await this.QuestionServiceObj.deleteCommentService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async dyanmicLinkController(requestData) {
        try {
            return await this.QuestionServiceObj.createDynamicLinkService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async likePostController(requestData, userId) {
        try {
            if (parseInt(requestData.type) === LIKE_TYPE.LIKE)
                return await this.QuestionServiceObj.likePostService(requestData, userId)
            else if (parseInt(requestData.type) === LIKE_TYPE.DISLIKE)
                return await this.QuestionServiceObj.dislikePostService(requestData, userId);
        }
        catch (err) {
            if (err.parent && err.parent.code === ORM_ERRORS.ALREADY_EXISTS && err.fields && (err.fields.user_id && err.fields.question_shared_id)) {
                err.statusCode = HTTP_CODES.BAD_REQUEST
                err.errorMessage = ERROR_MESSSAGES.ALREADY_LIKED
            }
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getTrendingQuestionController(requestData, userId) {
        try {
            return await this.QuestionServiceObj.getTrendingQuestionService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async deleteSilentPushAuditController(requestData, userId) {
        try {
            return await this.QuestionServiceObj.deleteFromSilentPushAuditService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getReportReasonController(req, userId) {
        try {
            if (!req || !req.type)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_TYPE_VALUE, HTTP_CODES.BAD_REQUEST);
            return await this.QuestionServiceObj.getReportReasonService(req);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async reportCommentController(requestData, userId) {
        try {
            if (!requestData.report_reason_id && !requestData.other_reason)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_REPORT_REASON, HTTP_CODES.BAD_REQUEST);
            return await this.QuestionServiceObj.reportCommentService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getCountyStateMasterController() {
        try {
            return await this.QuestionServiceObj.getCountyStateMasterService()
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async updateMasterCountyData() {
        try {
            return await this.QuestionServiceObj.updateCountyStateMasterData()
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getMapDataController(requestData) {
        try {
            return await this.QuestionServiceObj.getMapDataService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getMapDataListController(requestData) {
        try {
            return await this.QuestionServiceObj.getMapDataListService(requestData);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async reportPostController(requestData, userId) {
        try {
            if (!requestData.report_reason_id && !requestData.other_reason)
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_REPORT_REASON, HTTP_CODES.BAD_REQUEST);
            return await this.QuestionServiceObj.reportPostService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async sendReportToAdminScriptController() {
        try {
            return await this.QuestionServiceObj.scriptToSendEmailToAdminOnPostReportsService();
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getQuestionTyps() {
        try {
            return await this.QuestionServiceObj.getQuestionTypesService();
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async searchQuestions(requestData, userId) {
        try {
            return await this.QuestionServiceObj.searchQuestionsService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async getSearchSuggestions(requestData, userId) {
        try {
            return await this.QuestionServiceObj.getSearchSuggestionsService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    //getGlobalSearchData
    async getGlobalSearchData(requestData, userId) {
        try {
            return await this.QuestionServiceObj.getGloablSearchService(requestData, userId);
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async deleteQuestionAndRelatedPostController(question_id) {
        try {
            return await this.QuestionServiceObj.deleteQuestionAndRelatedPostService(question_id);
        } catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async deleteSharedPostsController(question_shared_id) {
        try {
            return await this.QuestionServiceObj.deleteSharedPostsService(question_shared_id);
        } catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }
}

module.exports = QuestionController