//import node-modules..
const Express = require("express");
const Router = Express.Router();
const UserValidators = require("../components/User/UserValidators");
const UserController = require("../components/User/UserController");
const {
  HTTP_CODES,
  SUCCESS_MESSAGES,
  FOLLOW_TYPE,
  FOLLOW_ACTION_TYPE,
  SUBSCRIPTION,
} = require("../utils/Constants");
const Multer = require("../middilewares/Multer");
const ResponseHandler = require("../helpers/Response");
const JWT = require("../middilewares/Jwt");
const Logger = require("../helpers/Logger");
const { UserModel } = require("../models");
const { v4: uuidv4 } = require("uuid");

Router.post("/add-state", async (req, res, next) => {
  try {
    const response = await new UserController().countryStateMaster();
  } catch (err) {
    console.log(err, "err");
  }
});

/**
 * @swagger
 * /user/signup:
 *   post:
 *     tags:
 *       - User
 *     name: Signup
 *     summary: Signup user
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: "1: Email, 2: Phone number, 3: Gmail, 4: Apple"
 *         schema:
 *           type: object
 *           properties:
 *             signup_type :
 *               type: number
 *             email:
 *               type: string
 *             country_code:
 *               type: string
 *             phone_number:
 *               type: string
 *             token :
 *               type: string
 *             password:
 *               type: string
 *             confirm_password :
 *               type: string
 *             is_business_account :
 *               type: boolean
 *             device_type:
 *               type: number
 *             date_of_birth:
 *               type: string
 *             gender:
 *               type: string
 *     responses:
 *       200:
 *         description: User Signup Successfully.
 */

Router.post(
  "/signup",
  [UserValidators.signupValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().signUpController({ ...req.body });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.SIGNUP_SUCCESS,
        commonResponse(data)
      );
    } catch (e) {
      next(e);
    }
  }
);

Router.post(
  "/signup-admin",
  [UserValidators.signupValidators],
  async (req, res, next) => {
    try {
      await UserModel.create({
        user_id: uuidv4(),
        email: "admin_wethink@gmail.com",
        first_name: "WeThink",
        last_name: "Admin",
        password:
          "$2b$10$r7dhTfKQVMCSqEwb0x/WuOzahHkSWu6V9r8lKEolIWWXGSrFXDai6",
        is_email_verified: true,
        is_phone_verified: false,
        is_active: true,
        notifications_enabled: true,
        user_name: "Admin WeThink",
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
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/business-categories:
 *   get:
 *     tags:
 *       - User
 *     name: Get Business Category Data
 *     summary: Get Business Category Data
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Business Category Data Found Successfully.
 */

Router.get("/business-categories", [], async (req, res, next) => {
  try {
    const data =
      await new UserController().getBusinessCategoryMasterController();
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.DATA_FOUND,
      data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/send-otp:
 *   post:
 *     tags:
 *       - User
 *     name: Send Otp
 *     summary: Send Otp
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             country_code:
 *               type: string
 *             phone_number:
 *               type: string
 *             email:
 *               type: string
 *     responses:
 *       200:
 *         description: Otp Send Successfully.
 */

Router.post(
  "/send-otp",
  [UserValidators.sendOtpValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().sendOtpController({
        ...req.body,
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.OTP_SENT_SUCCESS,
        commonResponse(data)
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/verify-otp:
 *   post:
 *     tags:
 *       - User
 *     name: Verify Otp
 *     summary: Verify Otp
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
 *             otp:
 *               type: string
 *     responses:
 *       200:
 *         description: OTP Verified Successfully.
 */

Router.post(
  "/verify-otp",
  [UserValidators.verifyOtpValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().verifyOtpController({
        ...req.body,
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.OTP_VERIFIED_SUCCESS,
        commonResponse(data)
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/update-profile-details:
 *   post:
 *     tags:
 *       - User
 *     name: Update Profile Details
 *     summary: Update Profile Details
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: "1: Male, 2: Female, 3: Prefer not to say"
 *         schema:
 *           type: object
 *           properties:
 *             user_id:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             username:
 *               type: string
 *             gender:
 *               type: string
 *             email:
 *               type: string
 *             phone_number:
 *               type: string
 *             state:
 *               type: string
 *             county:
 *               type: string
 *             state_symbol:
 *               type: string
 *             date_of_birth:
 *               type: string
 *             device_token:
 *               type: string
 *             device_type:
 *               type: number
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/update-profile-details",
  [UserValidators.profileUpdateOnSignupValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().updateProfileData({
        ...req.body,
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.PROFILE_DETAILS_UPDATED,
        commonResponse(data)
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/complete-business-profile:
 *   post:
 *     tags:
 *       - User
 *     name: Complete business profile
 *     summary: Complete business profile
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: profile_picture
 *         type: file
 *         required: false
 *       - in: formData
 *         name: business_account_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *       - in: formData
 *         name: phone_number
 *         type: string
 *       - in: formData
 *         name: address
 *         type: string
 *         required: false
 *       - in: formData
 *         name: website
 *         type: string
 *         required: false
 *       - in: formData
 *         name: user_id
 *         type: string
 *         required: true
 *       - in: formData
 *         name: business_latitude
 *         type: string
 *         required: false
 *       - in: formData
 *         name: business_longitude
 *         type: string
 *         required: false
 *       - in: formData
 *         name: city
 *         type: string
 *         required: false
 *       - in: formData
 *         name: state
 *         type: string
 *         required: false
 *       - in: formData
 *         name: county
 *         type: string
 *         required: false
 *       - in: formData
 *         name: state_symbol
 *         type: string
 *         required: false
 *       - in: formData
 *         name: device_token
 *         type: string
 *         required: true
 *       - in: formData
 *         name: device_type
 *         type: string
 *         required: true
 *       - in: formData
 *         name: title
 *         type: string
 *       - in: formData
 *         name: user_name
 *         type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/complete-business-profile",
  [
    new JWT().verifyBusinessProfileToken,
    Multer.singleFile("profile_picture"),
    UserValidators.completeBusinessProfileValidators,
  ],
  async (req, res, next) => {
    try {
      let userId = "";
      if (req.user && req.user.id && req.body.user_id) userId = req.user.id;
      else if (req.user && req.user.id) userId = req.user.id;
      else if (req.body.user_id) userId = req.body.user_id;
      const data = await new UserController().completeBusinessProfileData(
        { ...req.body },
        { ...req.file },
        userId
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.PROFILE_DETAILS_UPDATED,
        commonResponse(data)
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - User
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
 *             login_entity:
 *               type: string
 *             password:
 *               type: string
 *             login_type:
 *               type: number
 *             device_token:
 *               type: string
 *             device_type:
 *               type: number
 *             token:
 *               type: string
 *             country_code:
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
      const data = await new UserController().login({ ...req.body });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.LOGIN_SUCCESS,
        commonResponse(data)
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/contacts:
 *   post:
 *     tags:
 *       - User
 *     name: Save Contacts
 *     summary: Save Contacts
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
 *             contacts:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   contact_name:
 *                         type: string
 *                   contact_numbers:
 *                         type: string
 *     responses:
 *       200:
 *         description: Contacts Saved Successfully
 */

Router.post(
  "/contacts",
  [new JWT().verifyToken, UserValidators.saveContactsValidators],
  async (req, res, next) => {
    try {
      await new UserController().saveContactsController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.CONTACTS_SAVED,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/contacts:
 *   get:
 *     tags:
 *       - User
 *     name: get contacts Services
 *     summary: get contacts Services
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
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
  "/contacts",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getContactsController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/questions:
 *   post:
 *     tags:
 *       - Questions
 *     name: Add Question API
 *     summary: Add Question API
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
 *            question_title:
 *               type: string
 *            question_type:
 *               type: number
 *            category_id:
 *               type: string
 *            image_url:
 *               type: string
 *            video_url:
 *               type: string
 *            video_thumbnail:
 *               type: string
 *            width:
 *               type: number
 *            height:
 *               type: number
 *            ratio:
 *               type: string
 *            question_uuid:
 *               type: string
 *            options:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                       type: string
 *                   option:
 *                       type: number
 *            answer_duration:
 *               type: number
 *            question_cover_type:
 *               type: number
 *     responses:
 *       200:
 *         description: Contacts Saved Successfully
 */

Router.post(
  "/questions",
  [new JWT().verifyToken, UserValidators.addQuestionsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().addQuestionController(
        { ...req.body, user: req._userProfile },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.QUESTION_ADDED,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/master/category:
 *   get:
 *     tags:
 *       - User
 *     name: get Category Master Services
 *     summary: get Category Master Services
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: is_home
 *         type: string
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
  "/master/category",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().getCategoryMasterController({
        ...req.query,
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

// =============== Upload Image ===============

/**
 * @swagger
 * /user/upload-photo:
 *   post:
 *     tags:
 *       - User
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
 *       - in: formData
 *         name: width
 *         type: integer
 *       - in: formData
 *         name: height
 *         type: integer
 *       - in: formData
 *         name: ratio
 *         type: string
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.post(
  "/upload-photo",
  [Multer.singleFile("image"), new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().uploadPhotoController({
        ...req.file,
        ...req.body,
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.PHOTO_UPLOAD_SUCCESS,
        { link: data }
      );
    } catch (e) {
      next(e);
    }
  }
);

// =============== Upload Media ===============

/**
 * @swagger
 * /user/upload-media:
 *   post:
 *     tags:
 *       - User
 *     name: upload photo
 *     summary: upload photo
 *     security:
 *       - JWT: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: media
 *         type: file
 *         required: true
 *       - in: formData
 *         name: width
 *         type: integer
 *       - in: formData
 *         name: height
 *         type: integer
 *       - in: formData
 *         name: ratio
 *         type: string
 *       - in: formData
 *         name: entityType
 *         type: string
 *         required: true
 *         description: question/post/profile-photo
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.post(
  "/upload-media",
  [Multer.singleFile("media"), new JWT().verifyToken],
  async (req, res, next) => {
    try {
      req.body.entityId = req.user.id;
      const data = await new UserController().uploadPhotoController({
        ...req.file,
        ...req.body,
        ...{ user: req.user },
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.PHOTO_UPLOAD_SUCCESS,
        { link: data }
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/questions/home:
 *   get:
 *     tags:
 *       - Questions
 *     name: get Home Details API
 *     summary: get Home Details API
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
 *       - name: category_filter
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
  "/questions/home",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getQuestionsOnCategoryController(
        { ...req.query },
        req.user.id,
        req._userProfile.dataValues.is_officially_verified
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

const commonResponse = (data) => {
  try {
    return {
      user_id: data.user_id,
      phone_number: data.phone_number || null,
      country_code: data.country_code,
      email: data.email || null,
      first_name: data.first_name,
      last_name: data.last_name,
      user_name: data.user_name,
      state: data.state,
      county: data.county,
      is_signup: data.is_signup || false,
      account_type: data.account_type || null,
      profile_picture: data.profile_picture,
      gender: data.gender,
      date_of_birth: data.date_of_birth,
      role: data.role,
      parent_id: data.parent_id,
      token: data.token || null,
      is_active: data.is_active,
      category: data.category || null,
      is_profile_completed: data.is_profile_completed,
      is_phone_verified: data.is_phone_verified,
      is_email_verified: data.is_email_verified,
      notifications_enabled: data.notifications_enabled || false,
      is_business_account: data.is_business_account || false,
      is_officially_verified: data.is_officially_verified || false,
      last_verified_date: Number(data.last_verified_date),
      contact_syncing_enabled: data.contact_syncing_enabled,
      is_suggestion_skipped: data.is_suggestion_skipped || false,
    };
  } catch (err) {
    Logger.error(err);
    throw err;
  }
};

const businessAccountResponse = (data) => {
  try {
    return {
      user_id: data.user_id,
      phone_number: data.phone_number || null,
      is_phone_verified: data.is_phone_verified,
      is_email_verified: data.is_email_verified,
      country_code: data.country_code,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      state: data.state,
      county: data.county,
      date_of_birth: data.date_of_birth,
      profile_picture: data.profile_picture,
      notifications_enabled: data.notifications_enabled || false,
      city: data.city,
      user_name: data.user_name,
      bio: data.bio,
      title: data.title,
      address: data.address,
      website: data.website,
      gender: data.gender,
      is_business_account: data.is_business_account || false,
      business_account_name: data.business_account_name,
      business_longitude: data.business_longitude,
      business_latitude: data.business_latitude,
    };
  } catch (err) {
    Logger.error(err);
    throw err;
  }
};

/**
 * @swagger
 * /user/questions/date:
 *   get:
 *     tags:
 *       - Questions
 *     name: get Questions on behalf of date
 *     summary: get Questions on behalf of date
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
 *       - name: date
 *         in: query
 *         type: string
 *         required: true
 *       - name: search
 *         in: query
 *         type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
  "/questions/date",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getQuestionOnDateController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     tags:
 *       - User
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
 *             login_entity:
 *               type: string
 *             type:
 *               type: number
 *             country_code:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post("/forgot-password", [], async (req, res, next) => {
  try {
    const data = await new UserController().forgotPasswordController({
      ...req.body,
    });
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.FORGOT_PASSWORD_LINK_SENT,
      commonResponse(data)
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     tags:
 *       - User
 *     name: Reset password API
 *     summary: Reset password API
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
 *             password:
 *               type: string
 *             confirm_password:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/reset-password",
  [UserValidators.resetPasswordValidators],
  async (req, res, next) => {
    try {
      await new UserController().resetPasswordController({ ...req.body });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.PASSWORD_UPDATED,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     tags:
 *       - User
 *     name: Logout API
 *     summary: Logout API
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
 *             device_token:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post("/logout", [new JWT().verifyToken], async (req, res, next) => {
  try {
    await new UserController().logoutController(
      req.user.id,
      req.header("Authorization"),
      req.body
    );
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      {}
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/send-email-verification:
 *   post:
 *     tags:
 *       - User
 *     name: Email Verification API
 *     summary: Email Verification API
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

Router.post("/send-email-verification", [], async (req, res, next) => {
  try {
    await new UserController().sendEmailVerificationController({ ...req.body });
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.EMAIL_VERIFICATION_LINK_SENT,
      {}
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags:
 *       - User
 *     name: Get Profile Data
 *     summary: Get Profile Data
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get("/profile", [new JWT().verifyToken], async (req, res, next) => {
  try {
    const data = await new UserController().getProfileDataController(
      req.user.id
    );
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.GET_SUCCESS,
      data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/questions/detail:
 *   get:
 *     tags:
 *       - Questions
 *     name: To get about question details
 *     summary: To get about question details
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: question_id
 *         type: string
 *         in: query
 *         required: true
 *       - name: gender
 *         type: string
 *         in: query
 *       - name: verified
 *         type: boolean
 *         in: query
 *       - name: state
 *         type: string
 *         in: query
 *       - name: county
 *         type: string
 *         in: query
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
  "/questions/detail",
  [new JWT().verifyToken, UserValidators.getQuestionDetailValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getQuestionDetailController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/answer:
 *   post:
 *     tags:
 *       - Questions
 *     name: Submit Answer API
 *     summary: Submit Answer API
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
 *             answer_id:
 *               type: string
 *             answer_reason:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/answer",
  [new JWT().verifyToken, UserValidators.saveAnswerQuestionValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().postAnswerController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.ANSWER_SAVED_SUCCESSFULLY,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

// =============== Update Profile ===============

/**
 * @swagger
 * /user/profile:
 *   put:
 *     tags:
 *       - User
 *     name: Update Profile API
 *     summary: Update Profile API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: false
 *       - in: formData
 *         name: first_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: last_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: user_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: gender
 *         type: string
 *         required: false
 *       - in: formData
 *         name: website
 *         type: string
 *         required: false
 *       - in: formData
 *         name: title
 *         type: string
 *         required: false
 *       - in: formData
 *         name: bio
 *         type: string
 *         required: false
 *       - in: formData
 *         name: address
 *         type: string
 *         required: false
 *       - in: formData
 *         name: phone_number
 *         type: string
 *         required: true
 *       - in: formData
 *         name: country_code
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *       - in: formData
 *         name: county
 *         type: string
 *         required: false
 *       - in: formData
 *         name: state
 *         type: string
 *         required: false
 *       - in: formData
 *         name: date_of_birth
 *         type: string
 *         required: false
 *       - in: formData
 *         name: state_symbol
 *         type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.put(
  "/profile",
  [
    new JWT().verifyToken,
    Multer.singleFile("image"),
    UserValidators.updateProfileValidators,
  ],
  async (req, res, next) => {
    try {
      const data = await new UserController().updateProfileController(
        { ...req.body },
        { ...req.file },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.PROFILE_UPDATED,
        commonResponse(data)
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/business-profile:
 *   put:
 *     tags:
 *       - User
 *     name: Update Profile API
 *     summary: Update Profile API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: false
 *       - in: formData
 *         name: user_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: website
 *         type: string
 *         required: false
 *       - in: formData
 *         name: title
 *         type: string
 *         required: false
 *       - in: formData
 *         name: bio
 *         type: string
 *         required: false
 *       - in: formData
 *         name: address
 *         type: string
 *         required: false
 *       - in: formData
 *         name: phone_number
 *         type: string
 *         required: true
 *       - in: formData
 *         name: country_code
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *       - in: formData
 *         name: county
 *         type: string
 *         required: false
 *       - in: formData
 *         name: state
 *         type: string
 *         required: false
 *       - in: formData
 *         name: business_account_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: city
 *         type: string
 *         required: false
 *       - in: formData
 *         name: business_latitude
 *         type: string
 *         required: false
 *       - in: formData
 *         name: business_longitude
 *         type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.put(
  "/business-profile",
  [
    new JWT().verifyToken,
    Multer.singleFile("image"),
    UserValidators.updateBusinessProfileValidators,
  ],
  async (req, res, next) => {
    try {
      const data = await new UserController().updateBusinessProfileController(
        { ...req.body },
        { ...req.file },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.PROFILE_UPDATED,
        businessAccountResponse(data[1])
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/skip-suggested-friend:
 *   patch:
 *     tags:
 *       - User
 *     name: Update suggested friend
 *     summary: Update suggested friend
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.patch(
  "/skip-suggested-friend",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      await new UserController().skipSuggestedFriendController(req.user.id);
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.SUGGESTED_FRIEND_SKIPPED,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/profile/privacy:
 *   patch:
 *     tags:
 *       - User
 *     name: Update profile Privacy
 *     summary: Update profile Privacy
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
 *             account_type:
 *               type: number
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.patch(
  "/profile/privacy",
  [new JWT().verifyToken, UserValidators.changeAccountPrivacySchema],
  async (req, res, next) => {
    try {
      await new UserController().updateAccountTypeController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.ACCOUNT_PRIVACY_UPDATED,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/share:
 *   post:
 *     tags:
 *       - User
 *     name: Share to Feed
 *     summary: Share to Feed
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
 *             share_message:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/share",
  [new JWT().verifyToken, UserValidators.userShareValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().shareQuestionController(
        { ...req.body, user: req._userProfile },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.QUESTION_SHARED,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/send-otp/reverify:
 *   post:
 *     tags:
 *       - User
 *     name: To send otp on change number
 *     summary: To send otp on change number
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
 *             phone_number:
 *               type: string
 *             country_code:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/send-otp/reverify",
  [new JWT().verifyToken, UserValidators.sendOtpValidators],
  async (req, res, next) => {
    try {
      await new UserController().sendOtpReverifyController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.OTP_SENT_SUCCESS,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/verify-otp/reverify:
 *   post:
 *     tags:
 *       - User
 *     name: To verify otp from changes number
 *     summary: To verify otp from changes number
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
 *             phone_number:
 *               type: string
 *             country_code:
 *               type: string
 *             otp:
 *               type: number
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/verify-otp/reverify",
  [new JWT().verifyToken, UserValidators.sendOtpValidators],
  async (req, res, next) => {
    try {
      await new UserController().reVerifyController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.OTP_VERIFIED_SUCCESS,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/profile/other:
 *   get:
 *     tags:
 *       - User
 *     name: View Other user profile data
 *     summary: View Other user profile data
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
 *         type: string
 *         in: query
 *         required: true
 *       - name: limit
 *         type: string
 *         in: query
 *         required: true
 *       - name: is_searched
 *         type: boolean
 *         in: query
 *         required: false
 *       - name: search
 *         type: string
 *         in: query
 *         required: false
 *       - name: category_id
 *         type: string
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
  "/profile/other",
  [new JWT().verifyToken, UserValidators.viewOtherProfileSchema],
  async (req, res, next) => {
    try {
      const data = await new UserController().viewOtherProfileController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/profile/other/new:
 *   get:
 *     tags:
 *       - User
 *     name: View Other user profile data
 *     summary: View Other user profile data
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
 *         type: string
 *         in: query
 *         required: true
 *       - name: limit
 *         type: string
 *         in: query
 *         required: true
 *       - name: is_searched
 *         type: boolean
 *         in: query
 *         required: false
 *       - name: search
 *         type: string
 *         in: query
 *         required: false
 *       - name: category_id
 *         type: string
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
  "/profile/other/new",
  [new JWT().verifyToken, UserValidators.viewOtherNewProfileSchema],
  async (req, res, next) => {
    try {
      const data = await new UserController().viewOtherNewProfileController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/follow:
 *   post:
 *     tags:
 *       - User
 *     name: To follow and unfollow users
 *     summary: To follow and unfollow users
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
 *             follow_type:
 *               type: number
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/follow",
  [new JWT().verifyToken, UserValidators.followUnfollowValidators],
  async (req, res, next) => {
    try {
      await new UserController().createFollowRequestController(
        { ...req.body },
        req.user.id
      );
      if (parseInt(req.body.follow_type) === FOLLOW_TYPE.FOLLOW)
        return ResponseHandler(
          res,
          HTTP_CODES.OK,
          SUCCESS_MESSAGES.FOLLOWED_SUCCESS,
          {}
        );
      else if (parseInt(req.body.follow_type) === FOLLOW_TYPE.UNFOLLOW)
        return ResponseHandler(
          res,
          HTTP_CODES.OK,
          SUCCESS_MESSAGES.UNFOLLOWED_SUCCESS,
          {}
        );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/profile/activity:
 *   get:
 *     tags:
 *       - User
 *     name: To view self profile activity
 *     summary: To view self profile activity
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
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

Router.get(
  "/profile/activity",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getMyActivityController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/profile/activity/new:
 *   get:
 *     tags:
 *       - User
 *     name: To view self profile activity
 *     summary: To view self profile activity
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
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

Router.get(
  "/profile/activity/new",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getMyActivityNewController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/follow/request:
 *   get:
 *     tags:
 *       - User
 *     name: To get Follow Requests
 *     summary: To get Follow Requests
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
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
  "/follow/request",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getFollowRequests(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/follow/action:
 *   put:
 *     tags:
 *       - User
 *     name: To accept and reject follow requests
 *     summary: To accept and reject follow requests
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
 *             follow_request_id:
 *               type: string
 *             action_type:
 *               type: number
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.put(
  "/follow/action",
  [new JWT().verifyToken, UserValidators.followActionValidators],
  async (req, res, next) => {
    try {
      await new UserController().followRequestActionController(
        { ...req.body },
        req.user.id
      );
      if (parseInt(req.body.action_type) === FOLLOW_ACTION_TYPE.ACCEPT)
        return ResponseHandler(
          res,
          HTTP_CODES.OK,
          SUCCESS_MESSAGES.REQUEST_ACCEPTED,
          {}
        );
      else
        return ResponseHandler(
          res,
          HTTP_CODES.OK,
          SUCCESS_MESSAGES.REQUEST_REJECTED,
          {}
        );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/dummy:
 *   post:
 *     tags:
 *       - User
 *     name: To create dummy follower
 *     summary: To create dummy follower
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             followed_by:
 *               type: string
 *             followed_to:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post("/dummy", [], async (req, res, next) => {
  try {
    const data = await new UserController().createDummyFollowerController({
      ...req.body,
    });
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.FOLLOWED_SUCCESS,
      data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/password:
 *   patch:
 *     tags:
 *       - User
 *     name: To change password
 *     summary: To change password
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
 *             old_password:
 *               type: string
 *             password:
 *               type: string
 *             confirm_password:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.patch(
  "/password",
  [new JWT().verifyToken, UserValidators.changePasswordValidators],
  async (req, res, next) => {
    try {
      await new UserController().changePasswordController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.PASSWORD_CHANGED,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/feed:
 *   get:
 *     tags:
 *       - User
 *     name: To get feed listing
 *     summary: To get feed listing
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
 *         description: User found and logged in successfully
 */

Router.get(
  "/feed",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getFeedListingController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/delete/account:
 *   delete:
 *     tags:
 *       - User
 *     name: API to delete account
 *     summary: API to delete account
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.delete(
  "/delete/account",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      await new UserController().deleteAccountController(req.user.id);
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DELETE_ACCOUNT
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/map:
 *   get:
 *     tags:
 *       - Map
 *     name: To get Map Sample Data
 *     summary: To get Map Sample Data
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get("/map", [], async (req, res, next) => {
  try {
    const data = await new UserController().getMapController();
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.DATA_FOUND,
      data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/search/friend:
 *   get:
 *     tags:
 *       - User
 *     name: To search friend
 *     summary: To search friend
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: search
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
 *         description: User found and logged in successfully
 */

Router.get(
  "/search/friend",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().getSearchPeopleController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/block:
 *   post:
 *     tags:
 *       - Block
 *     name: To block user
 *     summary: To block user
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
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post("/block", [new JWT().verifyToken], async (req, res, next) => {
  try {
    const data = await new UserController().blockUserController(
      { ...req.body },
      req.user.id
    );
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.BLOCKED_SUCCESS,
      data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/block/list:
 *   get:
 *     tags:
 *       - Block
 *     name: To search friend
 *     summary: To search friend
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
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get("/block/list", [new JWT().verifyToken], async (req, res, next) => {
  try {
    const data = await new UserController().getBlockListController(
      { ...req.query },
      req.user.id
    );
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.DATA_FOUND,
      data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/unblock:
 *   patch:
 *     tags:
 *       - Block
 *     name: To unblock user
 *     summary: To unblock user
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
 *             block_id:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.patch("/unblock", [new JWT().verifyToken], async (req, res, next) => {
  try {
    await new UserController().unblockUserController(
      { ...req.body },
      req.user.id
    );
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.UNBLOCKED_SUCCESS,
      {}
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/category/master/add:
 *   post:
 *     tags:
 *       - Master Category
 *     name: To add category Master
 *     summary: To add category Master
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             category_id:
 *               type: string
 *             category_name:
 *               type: string
 *             prefrence_order:
 *               type: number
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/category/master/add",
  [new JWT().verifyToken, UserValidators.addCategoryValidators],
  async (req, res, next) => {
    try {
      await new UserController().addCategoryController({ ...req.body });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.CATEGORY_ADDED,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/category/master/list:
 *   get:
 *     tags:
 *       - Master Category
 *     name: To add category Master
 *     summary: To add category Master
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get("/category/master/list", [], async (req, res, next) => {
  try {
    const data = await new UserController().getAllCategoryMasterList();
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.GET_SUCCESS,
      data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/category/master/update:
 *   put:
 *     tags:
 *       - Master Category
 *     name: To add category Master
 *     summary: To add category Master
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             category_id:
 *               type: string
 *             category_name:
 *               type: string
 *             updated_category_id:
 *               type: string
 *             prefrence_order:
 *               type: number
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.put(
  "/category/master/update",
  [new JWT().verifyToken, UserValidators.updateCategoryValidators],
  async (req, res, next) => {
    try {
      await new UserController().updateMasterCategoryController({
        ...req.body,
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.UPDATED_CATEGORY,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/category/master/delete:
 *   delete:
 *     tags:
 *       - Master Category
 *     name: To search friend
 *     summary: To search friend
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: category_id
 *         type: string
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.delete(
  "/category/master/delete",
  [new JWT().verifyToken, UserValidators.deleteCategoryValidators],
  async (req, res, next) => {
    try {
      await new UserController().deleteMasterController({ ...req.query });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/notification/settings:
 *   patch:
 *     tags:
 *       - Notification
 *     name: To change notification settings
 *     summary: To change notification settings
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
 *             status:
 *               type: boolean
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.patch(
  "/notification/settings",
  [
    new JWT().verifyToken,
    UserValidators.enableDisableNotificationSettingsValidators,
  ],
  async (req, res, next) => {
    try {
      await new UserController().enableDisableNotificationSettingController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.SETTING_UPDATED_SUCCESS,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/notification/list:
 *   get:
 *     tags:
 *       - Notification
 *     name: To get Notifications Lists
 *     summary: To get Notifications Lists
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
 *     responses:
 *       200:
 *         description: Notification data get Successfully
 */

Router.get(
  "/notification/list",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getNotificationListController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.NOTIFICATION_DATA,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/notification/seen:
 *   patch:
 *     tags:
 *       - Notification
 *     name: To update notification seen status
 *     summary: To update notification seen status
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
 *             notification_id:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.patch(
  "/notification/seen",
  [new JWT().verifyToken, UserValidators.updateNotificationSeenValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().updateSeenStatusController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/notification/check-status:
 *   get:
 *     tags:
 *       - Notification
 *     name: To check the status
 *     summary: To check the status
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: notification_id
 *         type: string
 *         in: query
 *         required: true
 *       - name: question_id
 *         type: string
 *         in: query
 *         required: false
 *       - name: question_shared_id
 *         type: string
 *         in: query
 *         required: false
 *       - name: comment_id
 *         type: string
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
  "/notification/check-status",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().checkAndGetStatusController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/notification/unread-count:
 *   get:
 *     tags:
 *       - Notification
 *     name: To get unread count
 *     summary: To get unread count
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
  "/notification/unread-count",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().getUnreadCountController(
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/search/suggestion:
 *   post:
 *     tags:
 *       - Search
 *     name: To add to search suggestions
 *     summary: To add to search suggestions
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
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/search/suggestion",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().addToSearchSuggestionController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/search-suggestion/list:
 *   get:
 *     tags:
 *       - Search
 *     name: To get the search suggestion lists
 *     summary: To get the search suggestion lists
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
  "/search-suggestion/list",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().getSearchSuggestionsController(
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/friend/list:
 *   get:
 *     tags:
 *       - Friend
 *     name: Get Friend List Service
 *     summary: Get Friend List Service
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
 *         required: false
 *       - name: user_id
 *         in: query
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User added in search suggestion lists
 */

Router.get(
  "/friend/list",
  [new JWT().verifyToken, UserValidators.getContactsValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getFriendListController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/connected-accounts:
 *   get:
 *     tags:
 *       - User
 *     name: Get connected account
 *     summary: Get connected account
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
  "/connected-accounts",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().getConnectedProfilesController(
        req.user.id,
        req.user.parent_id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/switch-profile:
 *   post:
 *     tags:
 *       - User
 *     name: User switch profile
 *     summary: User switch profile
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
 *             device_token:
 *               type: string
 *             device_type:
 *               type: number
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/switch-profile",
  [new JWT().verifyToken, UserValidators.switchProfileSchema],
  async (req, res, next) => {
    try {
      const data = await new UserController().switchProfileController({
        ...req.body,
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        commonResponse(data)
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/change-signup_entity:
 *   patch:
 *     tags:
 *       - User
 *     name: To change phone number or email
 *     summary: To change phone number or email
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             phone_number:
 *               type: string
 *             country_code:
 *               type: string
 *             email:
 *               type: string
 *             user_id:
 *               type: string
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.patch(
  "/change-signup_entity",
  [UserValidators.sendOtpValidators],
  async (req, res, next) => {
    try {
      await new UserController().changeNumberController({ ...req.body });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.OTP_SENT_SUCCESS,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/friend/suggested:
 *   get:
 *     tags:
 *       - Friend
 *     name: Get Suggesed Friend List Service
 *     summary: Get Suggesed Friend List Service
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
 *         required: false
 *       - name: user_id
 *         in: query
 *         type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Request success.
 */

Router.get(
  "/friend/suggested",
  [new JWT().verifyToken, UserValidators.getSuggestedFriendValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getSuggestedFriendListController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.GET_SUCCESS,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/contacts/settings:
 *   patch:
 *     tags:
 *       - User
 *     name: To change contact syncing settings
 *     summary: To change contact syncing settings
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
 *             status:
 *               type: boolean
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.patch(
  "/contacts/settings",
  [
    new JWT().verifyToken,
    UserValidators.enableDisableContactsSyncingValidators,
  ],
  async (req, res, next) => {
    try {
      await new UserController().enableDisableContactsSyncingController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.SETTING_UPDATED_SUCCESS,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/remove-suggested-friend:
 *   post:
 *     tags:
 *       - User
 *     name: To remove suggested friend
 *     summary: To remove suggested friend
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
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/remove-suggested-friend",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      await new UserController().removeSuggestedFriendController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.REMOVED_SUCCESSFULLY,
        {}
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/toggle-gender:
 *   post:
 *     tags:
 *       - User
 *     name: To toggle gender to show on profile or not
 *     summary: To toggle gender to show on profile or not
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
 *             toggle:
 *               type: boolean
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.post(
  "/toggle-gender",
  [new JWT().verifyToken, UserValidators.genderShowValidators],
  async (req, res, next) => {
    try {
      await new UserController().toggleGenderController(
        { ...req.body },
        req.user.id
      );
      if (req.body.toggle === true)
        return ResponseHandler(
          res,
          HTTP_CODES.OK,
          SUCCESS_MESSAGES.GENDER_SHOW,
          {}
        );
      else if (req.body.toggle === false)
        return ResponseHandler(
          res,
          HTTP_CODES.OK,
          SUCCESS_MESSAGES.GENDER_HIDE,
          {}
        );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/search:
 *   get:
 *     tags:
 *       - User
 *     name: To search users
 *     summary: To search users
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: search
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
 *         description: User found and logged in successfully
 */

Router.get(
  "/search",
  [new JWT().verifyToken, UserValidators.searchUserValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getSearchUserController(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/subscribe:
 *   post:
 *     tags:
 *       - User
 *     name: Subscribe/Unsubscribe to user.
 *     summary: Subscribe/Unsubscribe to user
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
 *             subscribe:
 *               type: boolean
 *             subscribed_to:
 *               type: string
 *     responses:
 *       200:
 *         description: Subscribed/Un-subscribed Successfully.
 */

// subscribe to any user ..

Router.post(
  "/subscribe",
  [new JWT().verifyToken, UserValidators.subscribeSchemaValidator],
  async (req, res, next) => {
    try {
      await new UserController().subscribeToUserController(
        { ...req.body },
        req.user.id
      );
      if (req.body.subscribe === true)
        return ResponseHandler(
          res,
          HTTP_CODES.OK,
          SUCCESS_MESSAGES.USER_SUBSCRIBED,
          {}
        );
      else if (req.body.subscribe === false)
        return ResponseHandler(
          res,
          HTTP_CODES.OK,
          SUCCESS_MESSAGES.USER_UNSUBSCRIBED,
          {}
        );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/report:
 *   post:
 *     tags:
 *       - Report User
 *     name: To report any user
 *     summary: To report any user
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
 *             reported_to:
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
  "/report",
  [new JWT().verifyToken, UserValidators.reportUserValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().reportuserController(
        { ...req.body },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.USER_REPORTED,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/subscription:
 *   put:
 *     tags:
 *       - User
 *     name: Update Subscription API
 *     summary: Update Subscription API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: "1: Active, 2: Inactive, 3: Cancelled"
 *         schema:
 *           type: object
 *           properties:
 *             subscription:
 *               type: string
 *     responses:
 *       200:
 *         description: Update subscription details.
 */

Router.put("/subscription", [new JWT().verifyToken], async (req, res, next) => {
  try {
    const data = await new UserController().updateSubscriptionController(
      { ...req.body },
      req.user.id
    );
    if (Number(req.body.subscription) === SUBSCRIPTION.ACTIVE)
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.SUBSCRIPTION_ACTIVE,
        data
      );
    else if (Number(req.body.subscription) === SUBSCRIPTION.INACTIVE)
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.SUBSCRIPTION_INACTIVE,
        data
      );
    else if (Number(req.body.subscription) === SUBSCRIPTION.CANCELLED)
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.SUBSCRIPTION_CANCELLED,
        data
      );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/kyc/verify:
 *   post:
 *     tags:
 *       - User
 *     name: Kyc Verify API
 *     summary: Kyc Verify API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               required: true
 *             mobile:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *             country:
 *               type: string
 *     responses:
 *       200:
 *         description: Kyc verify details.
 */

Router.post("/kyc/verify", [new JWT().verifyToken], async (req, res, next) => {
  try {
    const data = await new UserController().kycVerifyController(
      { ...req.body },
      req.user.id
    );
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.KYC_VERIFY_SUCCESS,
      data.data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/kyc/verify:
 *   get:
 *     tags:
 *       - User
 *     name: Kyc Verify API
 *     summary: Kyc Verify API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             uniqueID:
 *               type: string
 *               required: true
 *     responses:
 *       200:
 *         description: Kyc verify details.
 */

Router.get("/kyc/verify", [new JWT().verifyToken], async (req, res, next) => {
  try {
    const data = await new UserController().getKycVerifyController(req.body);
    return ResponseHandler(
      res,
      HTTP_CODES.OK,
      SUCCESS_MESSAGES.GET_KYC_VERIFY_SUCCESS,
      data.data
    );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/kyc/verify/edit:
 *   put:
 *     tags:
 *       - User
 *     name: Kyc Verify Edit API
 *     summary: Kyc Verify Edit API
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
 *             redirectURL:
 *               type: string
 *               required: true
 *             uniqueID:
 *               type: string
 *               required: true
 *     responses:
 *       200:
 *         description: Kyc verify edit details.
 */

Router.put(
  "/kyc/verify/edit",
  [new JWT().verifyToken],
  async (req, res, next) => {
    try {
      const data = await new UserController().kycVerifyEditController({
        ...req.body,
      });
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.KYC_VERIFY_SUCCESS,
        data.data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/kyc/status:
 *   put:
 *     tags:
 *       - User
 *     name: Update Kyc Status API
 *     summary: Update Status API
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: "1: Approve, 2: Reject"
 *         schema:
 *           type: object
 *           properties:
 *             is_kyc_verified:
 *               type: string
 *               required: true
 *             unique_id:
 *               type: string
 *               required: true
 *     responses:
 *       200:
 *         description: Update kyc status details.
 */

Router.put("/kyc/status", [new JWT().verifyToken], async (req, res, next) => {
  try {
    const data = await new UserController().kycVerifyStatusController(
      { ...req.body },
      req.user.id
    );
    if (req.body.is_kyc_verified === "1" && data)
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.KYC_STATUS_SUCCESS,
        data
      );
    else if (req.body.is_kyc_verified === "2" && data)
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.KYC_STATUS_REJECT,
        data
      );
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /user/following:
 *   get:
 *     tags:
 *       - User
 *     name: To get Following
 *     summary: To get Following
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
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
  "/following",
  [new JWT().verifyToken, UserValidators.getFollowingValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getFollowing(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @swagger
 * /user/follower:
 *   get:
 *     tags:
 *       - User
 *     name: To get Followers
 *     summary: To get Followers
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
 *     responses:
 *       200:
 *         description: User found and logged in successfully
 */

Router.get(
  "/followers",
  [new JWT().verifyToken, UserValidators.getFollowingValidators],
  async (req, res, next) => {
    try {
      const data = await new UserController().getFollowers(
        { ...req.query },
        req.user.id
      );
      return ResponseHandler(
        res,
        HTTP_CODES.OK,
        SUCCESS_MESSAGES.DATA_FOUND,
        data
      );
    } catch (e) {
      next(e);
    }
  }
);

// Router.get(
//     "/googleurl",
//     [],
//     async (req, res, next) => {
//         try {
//             const data = await new UserController().getUserGoogleUrlController()
//             return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.DATA_FOUND, data)
//         } catch (e) {
//             next(e)
//         }
//     }
// );

// Router.post(
//     "/googletoken",
//     [],
//     async (req, res, next) => {
//         try {
//             const data = await new UserController().userGoogleTokenController({ ...req.body })
//             return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.DATA_FOUND, data)
//         } catch (e) {
//             next(e)
//         }
//     }
// );

module.exports = Router;
