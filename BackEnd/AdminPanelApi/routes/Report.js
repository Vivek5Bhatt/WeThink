//import node-modules..
const Express = require("express");
const Router = Express.Router();
const ReportController = require('../components/Report/ReportController')
const { HTTP_CODES, SUCCESS_MESSAGES } = require('../utils/Constants')
const Multer = require('../middilewares/Multer')
const ResponseHandler = require('../helpers/Response');
const JWT = require("../middilewares/Jwt");
const Logger = require("../helpers/Logger");
const ReportValidators = require('../components/Report/ReportValidators')
//import other modoules..



//========================== verify email ==================================

/**
 * @swagger
 * /admin/report/master:
 *   post:
 *     tags:
 *       - Report
 *     name: To Add to report Master
 *     summary: To Add to report Master
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
 *             name:
 *               type: string
 *             type:
 *               type: number
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.post(
    "/master",
    [new JWT().verifyToken, ReportValidators.addToReportMasterValidators],
    async (req, res, next) => {
        try {
            const data = await new ReportController().addToReportMasterController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }

    }
);

/**
 * @swagger
 * /admin/report/master:
 *   get:
 *     tags:
 *       - Report
 *     name: Get report Master Listing
 *     summary: Get report Master Listing
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
 *       - name: search
 *         type: string
 *         in: query
 *         required: false
 *       - name: type
 *         type: number
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
    "/master",
    [new JWT().verifyToken, ReportValidators.getReportMasterListValidators],
    async (req, res, next) => {
        try {
            const data = await new ReportController().getAllReportMasterController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }

    }
);


//========================== verify email ==================================

/**
 * @swagger
 * /admin/report/master:
 *   delete:
 *     tags:
 *       - Report
 *     name: To Add to report Master
 *     summary: To Add to report Master
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
 *         description: Request success.
 */
Router.delete(
    "/master",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            await new ReportController().deleteReportMasterController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORT_MASTER_DELETED, {})
        }
        catch (e) {
            next(e)
        }

    }
);


/**
 * @swagger
 * /admin/report/reported-comment:
 *   get:
 *     tags:
 *       - Report
 *     name: To Add to report Master
 *     summary: To Add to report Master
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
 *       - name: report_status
 *         type: number
 *         in: query
 *         required: false
 *       - name: search
 *         type: string
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.get(
    "/reported-comment",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new ReportController().getReportedCommentListController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORTED_DATA_FOUND, data)
        }
        catch (e) {
            next(e)
        }

    }
);

/**
 * @swagger
 * /admin/report/reported-comment:
 *   patch:
 *     tags:
 *       - Report
 *     name: To update report comment status
 *     summary: To update report comment status
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
 *             report_status:
 *               type: number
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.patch(
    "/reported-comment",
    [new JWT().verifyToken, ReportValidators.updateReportStatusValidators],
    async (req, res, next) => {
        try {
            const data = await new ReportController().updateReportStatusController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORT_STATUS, data)
        }
        catch (e) {
            next(e)
        }

    }
);


/**
 * @swagger
 * /admin/report/master:
 *   patch:
 *     tags:
 *       - Report
 *     name: To update report master 
 *     summary: To update report master 
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
 *             name:
 *               type: string
 *             type:
 *               type: number
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.patch(
    "/master",
    [new JWT().verifyToken, ReportValidators.updateToReportMasterValidators],
    async (req, res, next) => {
        try {
            await new ReportController().updateReportMasterController({ ...req.body })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORT_MASTER_UPDATED, {})
        }
        catch (e) {
            next(e)
        }

    }
);


/**
 * @swagger
 * /admin/report/reported-comment/detail:
 *   get:
 *     tags:
 *       - Report
 *     name: To Add to report Master
 *     summary: To Add to report Master
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
 *         description: Request success.
 */
Router.get(
    "/reported-comment/detail",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new ReportController().getReportedCommentController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORTED_DATA_FOUND, data)
        }
        catch (e) {
            next(e)
        }

    }
);

/**
 * @swagger
 * /admin/report/reported-question:
 *   get:
 *     tags:
 *       - Report
 *     name: To get lists of reported questions
 *     summary: To get lists of reported questions
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
 *       - name: search
 *         type: string
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.get(
    "/reported-question",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new ReportController().getReportedQuestionListController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORTED_DATA_QUESTION_FOUND, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/report/reported-question/detail:
 *   get:
 *     tags:
 *       - Report
 *     name: To Add to report Master
 *     summary: To Add to report Master
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: string
 *         in: query
 *         required: true
 *       - name: search
 *         type: string
 *         in: query
 *         required: false
 *       - name: start_date
 *         type: number
 *         in: query
 *         required: false
 *       - name: end_date
 *         type: number
 *         in: query
 *         required: false
 *       - name: sort_type
 *         type: number
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.get(
    "/reported-question/detail",
    [new JWT().verifyToken, ReportValidators.reporteQuestionDetailValidators],
    async (req, res, next) => {
        try {
            const data = await new ReportController().getReportedQuestionController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORTED_DATA_QUESTION_FOUND, data);
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/report/reported-question:
 *   patch:
 *     tags:
 *       - Report
 *     name: To update report question status
 *     summary: To Add report question status
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
 *             report_status:
 *               type: number
 *             reject_reason:
 *               type: string
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.patch(
    "/reported-question",
    [new JWT().verifyToken, ReportValidators.updateReportQuestionStatusValidators],
    async (req, res, next) => {
        try {
            const data = await new ReportController().updateReportQuestionStatusController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORT_STATUS, data)
        }
        catch (e) {
            next(e)
        }

    }
);

/**
 * @swagger
 * /admin/report/reported-user:
 *   get:
 *     tags:
 *       - Report
 *     name: To get list of reported users
 *     summary: To get list of reported users
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
 *       - name: search
 *         type: string
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.get(
    "/reported-user",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new ReportController().getReportedUserListController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/report/reported-user/detail:
 *   get:
 *     tags:
 *       - Report
 *     name: To get details of reported user
 *     summary: To get details of reported user
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: user_id
 *         type: string
 *         in: query
 *         required: true
 *       - name: page_number
 *         type: number
 *         in: query
 *         required: true
 *       - name: limit
 *         type: number
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.get(
    "/reported-user/detail",
    [new JWT().verifyToken, ReportValidators.getReportedUserDetailValidators],
    async (req, res, next) => {
        try {
            const data = await new ReportController().getReporteduserController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORTED_DATA_QUESTION_FOUND, data);
        }
        catch (e) {
            next(e)
        }
    }
);


/**
 * @swagger
 * /admin/report/reported-users/action:
 *   patch:
 *     tags:
 *       - Report
 *     name: To accept/reject reported users via admin
 *     summary: To accept/reject reported users via admin
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
 *             report_id:
 *               type: string
 *             report_status:
 *               type: number
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.patch(
    "/reported-users/action",
    [new JWT().verifyToken, ReportValidators.reportedUserActionValidators],
    async (req, res, next) => {
        try {
            await new ReportController().reportActionController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORT_STATUS, {})
        }
        catch (e) {
            next(e)
        }

    }
);



/**
 * @swagger
 * /admin/report/reply:
 *   post:
 *     tags:
 *       - Report
 *     name: To single reply and reply all the users via reports
 *     summary: To single reply and reply all the users via reports
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
 *             reported_user_id:
 *               type: string
 *             type:
 *               type: number
 *             reported_question_id:
 *               type: number
 *             reply_message:
 *               type: string
 *             replied_to_user_id:
 *               type: string                                        
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.post(    
    "/reply",
    [new JWT().verifyToken,ReportValidators.reportReplyValidators],
    async (req, res, next) => {
        try {
            await new ReportController().reportReplyController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.REPORT_REPLY, {})
        }
        catch (e) {
            next(e)
        }

    }
);
module.exports = Router;
