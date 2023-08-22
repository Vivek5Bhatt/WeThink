//import node-modules..
const Express = require("express");
const Router = Express.Router();
const VerificationValidators = require("../components/Verification/VerificationValidators");
const VerificationController = require("../components/Verification/VerificationController");
const { HTTP_CODES, SUCCESS_MESSAGES } = require("../utils/Constants");
const Multer = require("../middilewares/Multer");
const ResponseHandler = require("../helpers/Response");
const JWT = require("../middilewares/Jwt");

/**
 * @swagger
 * /verification/categories:
 *   get:
 *     tags:
 *       - Verification
 *     name: Get verification categories
 *     summary: Get verification categories
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User added in search suggestion lists
 */

Router.get(
    "/categories",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new VerificationController().getVerificationCategoriesController()
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /verification/id-type:
 *   get:
 *     tags:
 *       - Verification
 *     name: Get identity types for verification
 *     summary: Get identity types for verification
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User added in search suggestion lists
 */

Router.get(
    "/id-type",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new VerificationController().getIdentityTypesController()
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /verification/verification-request:
 *   post:
 *     tags:
 *       - Verification
 *     name: To send request for verification
 *     summary: To send request for verification
 *     security:
 *       - JWT: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: user_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: full_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *       - in: formData
 *         name: phone_number
 *         type: string
 *         required: true
 *       - in: formData
 *         name: selfie_url
 *         type: string
 *         required: true
 *       - in: formData
 *         name: id_type
 *         type: string
 *         required: true
 *       - in: formData
 *         name: user_comment
 *         type: string
 *       - in: formData
 *         name: photo_id_front
 *         type: file
 *         required: true
 *       - in: formData
 *         name: photo_id_back
 *         type: file
 *         required: true
 *       - in: formData
 *         name: category_id
 *         type: number
 *         required: false
 *       - in: formData
 *         name: working_name
 *         type: number
 *         required: false
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
    "/verification-request",
    [Multer.multiFields([
        { name: 'photo_id_front' },
        { name: 'photo_id_back' }
    ]), new JWT().verifyToken, VerificationValidators.sendVerificationRequest],
    async (req, res, next) => {
        try {
            const data = await new VerificationController().sendVerificationRequest({ ...req.files }, { ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.VERIFICATION_REQUEST_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /verification/verification-request:
 *   get:
 *     tags:
 *       - Verification
 *     name: Get verification details
 *     summary: Get verification details
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User added in search suggestion lists
 */

Router.get(
    "/verification-request",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new VerificationController().getVerificationRequestController(req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /verification/resubmit-verification-form:
 *   put:
 *     tags:
 *       - Verification
 *     name: resubmit verification form
 *     summary: resubmit verification form
 *     security:
 *       - JWT: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: user_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: full_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: working_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *       - in: formData
 *         name: phone_number
 *         type: string
 *         required: true
 *       - in: formData
 *         name: category_id
 *         type: string
 *         required: true
 *       - in: formData
 *         name: id_type
 *         type: string
 *         required: true
 *       - in: formData
 *         name: user_comment
 *         type: string
 *         required: true
 *       - in: formData
 *         name: photo_id_front
 *         type: file
 *         required: false
 *       - in: formData
 *         name: photo_id_back
 *         type: file
 *         required: false
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.put(
    "/resubmit-verification-form",
    [new JWT().verifyToken, Multer.multiFields([
        { name: 'photo_id_front' },
        { name: 'photo_id_back' }
    ]), VerificationValidators.sendVerificationRequest],
    async (req, res, next) => {
        try {
            const data = await new VerificationController().resubmitVerificationRequest({ ...req.files }, { ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.VERIFICATION_REQUEST_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

module.exports = Router;
