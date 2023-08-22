//import node-modules..
const Express = require("express");
const Router = Express.Router();
const UserValidators = require('../components/User/UserValidators')
const UserController = require('../components/User/UserController')
const { HTTP_CODES, SUCCESS_MESSAGES } = require('../utils/Constants')
const Multer = require('../middilewares/Multer')
const ResponseHandler = require('../helpers/Response');
const JWT = require("../middilewares/Jwt");
const Logger = require("../helpers/Logger");
const { v4: uuidv4 } = require("uuid");
const { UserModel } = require("../models");
//import other modoules..

Router.post(
    "/signup-admin",
    async (req, res, next) => {
      try {
        await UserModel.create({
          user_id: uuidv4(),
          email: "admin_wethink1@gmail.com",
          first_name: "WeThink",
          last_name: "Admin",
          password:
            "$2b$10$r7dhTfKQVMCSqEwb0x/WuOzahHkSWu6V9r8lKEolIWWXGSrFXDai6",
          is_email_verified: true,
          is_phone_verified: false,
          is_active: true,
          notifications_enabled: true,
          user_name: "Admin WeThink1",
          role: 1,
          is_profile_completed: false,
          reset_password_token:
            "8f3583d907691b83326d78274e505ad7:5e8e37d012454313e9463a831fcdabf7b48c3b5f1f31d9a6e3b2f0fff50a6c153ea259a6",
          is_deleted: false,
          is_business_account: false,
          is_suggestion_skipped: false,
          is_officially_verified: false,
          contact_syncing_enabled: true,
          show_gender: true,
        }).then((res, err) => {
          if (res) {
            console.log(res, "res");
          } else console.log(err, "err");
        });
      } catch (e) {
        console.log(e);
        next(e);
      }
    }
  );


/**
 * @swagger
 * /admin/login:
 *   post:
 *     tags:
 *       - Admin
 *     name: Login API
 *     summary: Login API
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
    "/login",
    [UserValidators.loginValidators],
    async (req, res, next) => {
        try {
            const data = await new UserController().login({ ...req.body })
            const response = {
                user_id: data.user_id,
                email: data.email,
                profile_picture: data.profile_picture,
                token: data.token,
                is_active: data.is_active,
                role: data.role,
                name: data.first_name && data.last_name ? String(data.first_name) + ' ' + String(data.last_name) : `WeThink`
            }
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.LOGIN_SUCCESS, response)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/forgot-password:
 *   post:
 *     tags:
 *       - Admin
 *     name: Forgot password API
 *     summary: Forgot password API
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
    "/forgot-password",
    [UserValidators.forgotPasswordValidators],
    async (req, res, next) => {
        try {
            const data = await new UserController().forgotPasswordController({ ...req.body })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.FORGOT_PASSWORD_LINK, { link: data })
        }
        catch (e) {
            next(e)
        }
    }
);

// ============================== route for  adding questions ======================================

/**
 * @swagger
 * /admin/questions:
 *   post:
 *     tags:
 *       - Admin
 *     name: Add Questions API
 *     summary: Add Questions API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *       - in: formData
 *         name: question_title
 *         type: string
 *         required: true
 *       - in: formData
 *         name: category_id
 *         type: string
 *         required: true
 *       - in: formData
 *         name: options
 *         type: string
 *       - in: formData
 *         name: width
 *         type: number
 *         required: false
 *       - in: formData
 *         name: height
 *         type: number
 *         required: false
 *       - in: formData
 *         name: ratio
 *         type: string
 *         required: false
 *       - in: formData
 *         name: question_type
 *         type: number
 *         required: true
 *       - in: formData
 *         name: expire_at
 *         type: number
 *       - in: formData
 *         name: answer_duration
 *         type: number
 *       - in: formData
 *         name: question_cover_type
 *         type: number
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.post(
    "/questions",
    [Multer.singleFile('image'), new JWT().verifyToken, UserValidators.addQuestionsValidators],
    async (req, res, next) => {
        try {
            await new UserController().addQuestionController({ ...req.body }, { ...req.file }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.QUESTION_ADDED, {})
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/master/category:
 *   get:
 *     tags:
 *       - Admin
 *     name: get Category Master Services
 *     summary: get Category Master Services
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
    "/master/category",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new UserController().getCategoryMasterController()
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/questions:
 *   get:
 *     tags:
 *       - Admin
 *     name: Get Questions Lists with pagination
 *     summary: Get Questions Lists with pagination
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
 *         in: query
 *         type: number
 *         required: true
 *       - name: category_id
 *         in: query
 *         type: string
 *       - name: search
 *         in: query
 *         type: string
 *       - name: type
 *         in: query
 *         type: string
 *         required: true 
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
    "/questions",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new UserController().getQuestionsOnCategoryController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

//========================== reset password ==================================

/**
 * @swagger
 * /admin/reset-password:
 *   put:
 *     tags:
 *       - Admin
 *     name: Admin reset password  
 *     summary: Admin reset password
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             password:
 *               type: string
 *             confirm_password:
 *               type: string
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.put(
    "/reset-password", [UserValidators.resetPasswordValidators], async (req, res, next) => {
        try {
            await new UserController().updatePasswordController({ ...req.body })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.PASSWORD_UPDATED_SUCCESS, {})
        }
        catch (err) {
            next(err)
        }
    }
);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     tags:
 *       - Admin
 *     name: Logout  API
 *     summary: Logout  API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Contacts Saved Successfully
 */

Router.post(
    "/logout",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            await new UserController().logoutController(req.user.id, req.header('Authorization'))
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.LOGOUT_SUCCESS, {})
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/questions:
 *   delete:
 *     tags:
 *       - Admin
 *     name: to delete questions
 *     summary: to delete questions
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
 *         description: Request success.
 */

Router.delete(
    "/questions",
    [new JWT().verifyToken, UserValidators.deleteQuestionValidators],
    async (req, res, next) => {
        try {
            await new UserController().deleteQuestionController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.QUESTION_DELETED_SUCCESS, {})
        }
        catch (e) {
            next(e)
        }
    }
);

//========================== verify email ==================================

/**
 * @swagger
 * /admin/verify-email:
 *   put:
 *     tags:
 *       - Admin
 *     name: Verify Email API  
 *     summary: Verify Email API
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.put(
    "/verify-email", [], async (req, res, next) => {
        try {
            await new UserController().verifyEmailController({ ...req.body })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.EMAIL_VERIFIED_SUCCESS, {})
        }
        catch (err) {
            next(err)
        }
    }
);

//====================== upload image ====================================

/**
 * @swagger
 * /admin/upload-photo:
 *   post:
 *     tags:
 *       - Admin
 *     name: upload photo
 *     summary: upload photo
 *     security:
 *       - JWT: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.post(
    "/upload-photo",
    [Multer.singleFile('image'), new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new UserController().uploadPhotoController({ ...req.file })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.PHOTO_UPLOAD_SUCCESS, { link: data })
        }
        catch (e) {
            next(e)
        }
    }
);

// ============================== route for  updating questions ======================================
/**
 * @swagger
 * /admin/questions:
 *   put:
 *     tags:
 *       - Admin
 *     name: Update Questions API
 *     summary: Update Questions API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *       - in: formData
 *         name: question_title
 *         type: string
 *         required: true
 *       - in: formData
 *         name: category_id
 *         type: string
 *         required: true
 *       - in: formData
 *         name: options
 *         type: string
 *         required: true
 *       - in: formData
 *         name: question_id
 *         type: string
 *         required: true
 *       - in: formData
 *         name: image_url
 *         type: string
 *       - in: formData
 *         name: question_type
 *         type: number
 *       - in: formData
 *         name: width
 *         type: number
 *       - in: formData
 *         name: height
 *         type: number
 *       - in: formData
 *         name: ratio
 *         type: string
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.put(
    "/questions",
    [Multer.singleFile('image'), new JWT().verifyToken, UserValidators.addQuestionsValidators],
    async (req, res, next) => {
        try {
            req.body.toUpdate = true;
            await new UserController().addQuestionController({ ...req.body }, { ...req.file }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.QUESTION_ADDED, {})
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/questions/detail:
 *   get:
 *     tags:
 *       - Admin
 *     name: to delete questions
 *     summary: to delete questions
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
 *         description: Request success.
 */

Router.get(
    "/questions/detail",
    [new JWT().verifyToken, UserValidators.deleteQuestionValidators],
    async (req, res, next) => {
        try {
            const data = await new UserController().getQuestionDetailController({ ...req.query })
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.DATA_FOUND, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/submitted-question:
 *   get:
 *     tags:
 *       - Admin
 *     name: Get Submission List with pagination
 *     summary: Get Submission List with pagination
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
 *         in: query
 *         type: number
 *         required: true
 *       - name: search
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
    "/submitted-question",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new UserController().getSubmissionListController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/user/profile:
 *   get:
 *     tags:
 *       - Admin
 *     name: to get user profile details
 *     summary: to get user profile details
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: user_id
 *         type: string
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
    "/user/profile",
    [new JWT().verifyToken, UserValidators.getProfileDetailsValidators],
    async (req, res, next) => {
        try {
            const data = await new UserController().getUserDetailsController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/user/profile-action:
 *   patch:
 *     tags:
 *       - Admin
 *     name: Users profile status update
 *     summary: Users profile status update
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
 *             user_id:
 *               type: string
 *             account_status:
 *               type: boolean
 *             reject_reason:
 *               type: string
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.patch(
    "/user/profile-action",
    [new JWT().verifyToken, UserValidators.profileActionsValidators],
    async (req, res, next) => {
        try {
            const data = await new UserController().profileActionController({ ...req.body }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.USERS_ACCOUNT_STATUS, data[1])
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/user/:
 *   get:
 *     tags:
 *       - Admin
 *     name: To get user lists
 *     summary: To get user lists
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
    "/user",
    [new JWT().verifyToken, UserValidators.getContactsValidators],
    async (req, res, next) => {
        try {
            const data = await new UserController().getUserListController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/user/verification-form-list:
 *   get:
 *     tags:
 *       - Admin
 *     name: To get verification form lists
 *     summary: To get verification form lists
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
 *         description: search by name,username,email,phone number.
 *       - name: status
 *         type: number
 *         in: query
 *         required: false
 *         description: search by 1->pending,2->accepted,3->rejected,4-resubmit.
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
    "/user/verification-form-list",
    [new JWT().verifyToken, UserValidators.getVerificationFormListValidators],
    async (req, res, next) => {
        try {
            const data = await new UserController().getVerificationFormListController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/user/verification-form:
 *   get:
 *     tags:
 *       - Admin
 *     name: to get user verification form details
 *     summary: to get user verification form details
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
    "/user/verification-form",
    [new JWT().verifyToken, UserValidators.getVerificationFormDetailsValidators],
    async (req, res, next) => {
        try {
            const data = await new UserController().getUserVerificationFormDetailsController({ ...req.query }, req.user.id)
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data)
        }
        catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/user/delete-suspend:
 *   put:
 *     tags:
 *       - Admin
 *     name: User account delete and suspend
 *     summary: User account delete and suspend
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
 *             user_id:
 *               type: string
 *             account_status:
 *               type: number
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.put(
    "/user/delete-suspend",
    [new JWT().verifyToken, UserValidators.deleteSuspendValidators],
    async (req, res, next) => {
        try {
            await new UserController().deleteSuspendController({ ...req.body })
            if (req.body.account_status === 1)
                return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.ACCOUNT_SUSPEND, {})
            else if (req.body.account_status === 2)
                return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.ACCOUNT_DELETED, {})
            else if (req.body.account_status === 3)
                return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.ACCOUNT_RESTORED, {})
        } catch (e) {
            next(e)
        }
    }
);

/**
 * @swagger
 * /admin/dummy/api:
 *   get:
 *     tags:
 *       - Dummy
 *     name: Dummy API
 *     summary: Dummy API
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
    "/dummy/api",
    [],
    async (req, res, next) => {
        try {
            return ResponseHandler(res, HTTP_CODES.OK, `This is the dummy API (Changes)`, {})
        }
        catch (e) {
            next(e)
        }
    }
)

module.exports = Router;
