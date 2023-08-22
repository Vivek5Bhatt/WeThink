//import node-modules..
const Express = require("express");
const Router = Express.Router();
const QuestionValidators = require('../components/Questions/QuestionValidators')
const QuestionController = require('../components/Questions/QuestionController')
const { HTTP_CODES, SUCCESS_MESSAGES } = require('../utils/Constants')
const Multer = require('../middilewares/Multer')
const ResponseHandler = require('../helpers/Response');
const JWT = require("../middilewares/Jwt");
const Logger = require("../helpers/Logger");

/**
 * @swagger
 * /question/comment/status:
 *   patch:
 *     tags:
 *       - Questions
 *     name: To change comment status
 *     summary: To change comment status
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             status:
 *               type: boolean
 *             type:
 *               type: number
 *     responses:
 *       200:
 *         description: User comment status successfully.
 */

Router.patch(
    "/comment/status",
    [new JWT().verifyToken, QuestionValidators.enableDisableValidators],
    async (req, res, next) => {
        try {
            await new QuestionController().enableDisableCommentController({ ...req.body }, req.user.id);
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.STATUS_UPDATED, {})
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/comment:
 *   post:
 *     tags:
 *       - Questions
 *     name: To add a comment and reply on comment
 *     summary: To add a comment and reply on comment
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             question_id:
 *               type: string
 *             comment:
 *               type: string
 *             parent_id:
 *               type: string
 *             question_shared_id:
 *               type: string
 *             user_mentions:
 *               type: array
 *               items:
 *                  type: string
 *     responses:
 *       200:
 *         description: Question comment status successfully.
 */

Router.post(
    "/comment",
    [new JWT().verifyToken, QuestionValidators.postCommentValidators],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().createCommentController({ ...req.body }, req.user.id);
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.COMMENT_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/comment/new:
 *   post:
 *     tags:
 *       - Questions
 *     name: To add a comment and reply on comment
 *     summary: To add a comment and reply on comment
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             question_id:
 *               type: string
 *             comment:
 *               type: string
 *             parent_id:
 *               type: string
 *             question_shared_id:
 *               type: string
 *             user_mentions:
 *               type: array
 *               items:
 *                  type: string
 *     responses:
 *       200:
 *         description: Question comment status successfully.
 */

Router.post(
    "/comment/new",
    [new JWT().verifyToken, QuestionValidators.postCommentValidators],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().createCommentController({ ...req.body, new: true }, req.user.id);
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.COMMENT_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/comment:
 *   get:
 *     tags:
 *       - Questions
 *     name: Get Comment lists
 *     summary: Get Comment lists
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: string
 *         in: query
 *         required: true
 *       - name: offset
 *         type: number
 *         in: query
 *         required: true
 *       - name: limit
 *         in: query
 *         type: number
 *         required: true
 *       - name: get_comment_type
 *         in: query
 *         type: number
 *         required: true
 *       - name: comment_id
 *         in: query
 *         type: string
 *         required: false
 *       - name: reply_comment_id
 *         in: query
 *         type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Question comment status successfully.
 */

Router.get(
    "/comment",
    [new JWT().verifyToken, QuestionValidators.getCommentListValidators],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getCommentListController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/reply/comment:
 *   get:
 *     tags:
 *       - Questions
 *     name: Get reply comment lists
 *     summary: Get reply comment lists
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: parent_id
 *         type: string
 *         in: query
 *         required: true
 *       - name: offset
 *         type: number
 *         in: query
 *         required: true
 *       - name: limit
 *         in: query
 *         type: number
 *         required: true
 *       - name: reply_comment_id
 *         type: string
 *         in: query
 *         required: false
 *       - name: scroll_type
 *         type: integer
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Question reply comment status successfully.
 */

Router.get(
    "/reply/comment",
    [new JWT().verifyToken, QuestionValidators.getReplyCommentListValidators],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getReplyCommentListController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/mention:
 *   get:
 *     tags:
 *       - Questions
 *     name: Mention Users API
 *     summary: Mention Users API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: search
 *         in: query
 *         type: string
 *         required: true
 *       - name: page_number
 *         type: number
 *         in: query
 *         required: true
 *       - name: limit
 *         in: query
 *         type: number
 *         required: true
 *       - name: device_type
 *         in: query
 *         type: number
 *         required: false
 *     responses:
 *       200:
 *         description: Question mention data get successfully.
 */

Router.get(
    "/mention",
    [new JWT().verifyToken, QuestionValidators.getMentionUsersValidators],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().mentionUsersController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/comment:
 *   delete:
 *     tags:
 *       - Questions
 *     name: To delete comments on question
 *     summary: To delete comments on question
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: comment_id
 *         type: string
 *         in: query
 *         required: true
 *       - name: question_id
 *         in: query
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Question mention data deleted successfully.
 */

Router.delete(
    "/comment",
    [new JWT().verifyToken, QuestionValidators.deleteCommentValidators],
    async (req, res, next) => {
        try {
            await new QuestionController().deleteCommentController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.COMMENT_DELETED, {})
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/dynamic-link:
 *   get:
 *     tags:
 *       - Questions
 *     name: Get Dynamic Link
 *     summary: Get Dynamic Link
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: question_id
 *         type: string
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Question dynamic link data get successfully.
 */

Router.get(
    "/dynamic-link",
    [new JWT().verifyToken, QuestionValidators.getDynamicLinkSchemaValidators],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().dyanmicLinkController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/like:
 *   post:
 *     tags:
 *       - Questions
 *     name: To like any post
 *     summary: To like any post
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             question_id:
 *               type: string
 *             question_shared_id:
 *               type: string
 *             type:
 *               type: number
 *     responses:
 *       200:
 *         description: Question like data updated successfully.
 */

Router.post(
    "/like",
    [new JWT().verifyToken, QuestionValidators.likePostValidators],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().likePostController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/trending:
 *   get:
 *     tags:
 *       - Questions
 *     name: Get Trending Questions
 *     summary: Get Trending Questions
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: page_number
 *         type: number
 *         in: query
 *         required: true
 *       - name: limit
 *         type: number
 *         in: query
 *         required: true
 *       - name: category_id
 *         type: string
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Question trending data get successfully.
 */

Router.get(
    "/trending",
    [new JWT().verifyToken, QuestionValidators.getTrendingQuestionValidators],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getTrendingQuestionController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/silent-push:
 *   delete:
 *     tags:
 *       - Questions
 *     name: Delete from silent push audit
 *     summary: Delete from silent push audit
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: string
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Question silent push data deleted successfully.
 */

Router.delete(
    "/silent-push",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            await new QuestionController().deleteSilentPushAuditController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, {})
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/report/master:
 *   get:
 *     tags:
 *       - Questions
 *     name: API to get the report reason master
 *     summary: API to get the report reason master
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
*     parameters:
 *       - name: type
 *         type: number
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
    "/report/master",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getReportReasonController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/report/comment:
 *   post:
 *     tags:
 *       - ReportComments
 *     name: To report any comments
 *     summary: To report any comments
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             question_id:
 *               type: string
 *             question_shared_id:
 *               type: string
 *             comment_id:
 *               type: string
 *             report_reason_id:
 *               type: string
 *             other_reason:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
    "/report/comment",
    [new JWT().verifyToken, QuestionValidators.reportCommentsValidtors],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().reportCommentController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.COMMENT_REPORTED, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/master/state/county:
 *   get:
 *     tags:
 *       - Map
 *     name: To get county and state master
 *     summary: To get county and state master
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
    "/master/state/county",
    [],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getCountyStateMasterController()
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.DATA_FOUND, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/master/update:
 *   get:
 *     tags:
 *       - Map
 *     name: To update master and audit table
 *     summary: To update master and audit table
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
    "/master/update",
    [],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().updateMasterCountyData()
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.DATA_FOUND, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/map/data:
 *   get:
 *     tags:
 *       - Map
 *     name: To get data on maps
 *     summary: To get data on maps
 *     consumes:
 *       - application/json
 *     security:
 *       - JWT: []
 *     parameters:
 *       - name: question_id
 *         type: string
 *         in: query
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
    "/map/data",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getMapDataController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.DATA_FOUND, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/map/data/list:
 *   get:
 *     tags:
 *       - Map
 *     name: To get data list on maps
 *     summary: To get data list on maps
 *     consumes:
 *       - application/json
 *     security:
 *       - JWT: []
 *     parameters:
 *       - name: question_id
 *         type: string
 *         in: query
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
    "/map/data/list",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getMapDataListController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.DATA_FOUND, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/report/post:
 *   post:
 *     tags:
 *       - Report Post
 *     name: To report any post
 *     summary: To report any post
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             question_id:
 *               type: string
 *             question_shared_id:
 *               type: string
 *             report_reason_id:
 *               type: string
 *             other_reason:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
    "/report/post",
    [new JWT().verifyToken, QuestionValidators.reportPostValidtors],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().reportPostController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.POST_REPORTED, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/script-report/email:
 *   post:
 *     tags:
 *       - Questions
 *     name: To send email on reported posts
 *     summary: To send email on reported posts
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
    "/script-report/email",
    [],
    async (req, res, next) => {
        try {
            await new QuestionController().sendReportToAdminScriptController();
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.COMMENT_SUCCESS, {})
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/question-types:
 *   get:
 *     tags:
 *       - Questions
 *     name: Api to ger question types
 *     summary: Api to ger question types
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Request success.
 */

// =============== Question Type Master ===============

Router.get(
    "/question-types",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getQuestionTyps();
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/search:
 *   get:
 *     tags:
 *       - Questions
 *     name: Get Posts Data
 *     summary: Get Posts Data
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: search
 *         type: string
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Request success.
 */

// =============== Search by Elastic Search ===============

Router.get(
    "/search",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().searchQuestions({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/search-suggestions:
 *   get:
 *     tags:
 *       - Questions
 *     name: Get Search Recommendations
 *     summary: Get Search Recommendations
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Request success.
 */

// =============== Get Search Suggestions ===============

Router.get(
    "/search-suggestions",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getSearchSuggestions({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /question/global/search:
 *   get:
 *     tags:
 *       - Map
 *     name: To get global search data
 *     summary: To get global search data
 *     consumes:
 *       - application/json
 *     security:
 *       - JWT: []
 *     parameters:
 *       - name: search
 *         type: string
 *         in: query
 *         required: true
 *       - name: category_id
 *         type: string
 *         in: query
 *       - name: page_number
 *         type: string
 *         in: query
 *         required: true
 *       - name: limit
 *         type: string
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

// =============== Global Search On Posts ===============
Router.get(
    "/global/search",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getGlobalSearchData({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.DATA_FOUND, data)
        } catch (e) {
            next(e)
        }
    }
);

module.exports = Router;
