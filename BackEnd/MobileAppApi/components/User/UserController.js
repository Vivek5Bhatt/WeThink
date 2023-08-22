const UserService = require("./UserServices");
const {
  ORM_ERRORS,
  HTTP_CODES,
  ERROR_MESSSAGES,
  LOGIN_TYPE,
  FORGOT_PASSWORD_TYPE,
  QUESTION_TYPE,
} = require("../../utils/Constants");
const ErrorHandler = require("../../helpers/ErrorHandler");
const Logger = require("../../helpers/Logger");
const {
  checkValidUUID,
  checkImageSize,
  checkValidDateFormat,
  checkPassword,
  checkValidUserName,
} = require("../../utils/CommonFunctions");
const { getStartOfDay, getPreviousYearDate } = require("../../helpers/Moment");
const QuestionRepository = require("../Questions/QuestionRepository");
const { UserBlocksModel } = require("../../models");
const QuestionRepositoryObj = new QuestionRepository();

class UserController {
  constructor() {
    this.userServiceObj = new UserService();
  }

  async countryStateMaster() {
    try {
      return await this.userServiceObj.countryStateMasterService();
    } catch (err) {
      console.log(err);
    }
  }

  async signUpController(requestData) {
    try {
      if (
        requestData.phone_number &&
        (!requestData.country_code.includes("+") ||
          requestData.country_code.length > 4)
      ) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_COUNTRY_CODE,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.signUpService(requestData);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async sendOtpController(requestData) {
    try {
      if (
        requestData.phone_number &&
        (!requestData.country_code.includes("+") ||
          requestData.country_code.length > 4)
      ) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_COUNTRY_CODE,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.sendOtpService(requestData);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async verifyOtpController(requestData) {
    try {
      if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.verifyOtpService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      this.commonErrorHandler(err);
      throw err;
    }
  }

  async updateProfileData(requestData) {
    try {
      if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (
        requestData.date_of_birth &&
        !checkValidDateFormat(requestData.date_of_birth)
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_DATE_FORMAT,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.updateProfileOnSignupService(
        requestData
      );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async completeBusinessProfileData(requestData, imageData, userId) {
    try {
      return await this.userServiceObj.completeBusinessProfileDataService(
        requestData,
        imageData,
        userId
      );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async login(requestData) {
    try {
      requestData.login_type = Number(requestData.login_type);
      if (
        (requestData.login_type === LOGIN_TYPE.PHONE_NUMBER ||
          requestData.login_type === LOGIN_TYPE.EMAIL) &&
        !requestData.password
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.PASSWORD_MISSING,
          HTTP_CODES.BAD_REQUEST
        );
      if (
        (requestData.login_type === LOGIN_TYPE.PHONE_NUMBER ||
          requestData.login_type === LOGIN_TYPE.EMAIL) &&
        !requestData.login_entity
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.LOGIN_ENTITY_MISSING,
          HTTP_CODES.BAD_REQUEST
        );
      if (
        (requestData.login_type === LOGIN_TYPE.GMAIL ||
          requestData.login_type === LOGIN_TYPE.APPLE) &&
        !requestData.token
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.TOKEN_MISSING,
          HTTP_CODES.BAD_REQUEST
        );
      if (requestData.login_type === LOGIN_TYPE.PHONE_NUMBER) {
        if (
          !requestData.country_code.includes("+") ||
          requestData.country_code.length > 3
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_COUNTRY_CODE,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (
          requestData.login_entity.length > 15 ||
          requestData.login_entity.length < 10
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.PHONE_NUMBER_LENGTH,
            HTTP_CODES.BAD_REQUEST
          );
        }
      }
      if (requestData.password && !checkPassword(requestData.password)) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_PASSWORD_FORMAT,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.loginService(requestData);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async saveContactsController(requestData, userId) {
    try {
      return await this.userServiceObj.saveContactsService(requestData, userId);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getContactsController(requestData, userId) {
    try {
      const data = await this.userServiceObj.getContactsService(
        requestData,
        userId
      );
      const responseData = {};
      if (data.length) {
        responseData.data = data;
        responseData.total_count = data[0].total_count || 0;
      } else {
        responseData.data = [];
        responseData.total_count = 0;
      }
      return responseData;
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async addQuestionController(requestData, userId) {
    try {
      // if mcq rating then options are required else will be generated by common method ..
      if (Number(requestData.question_type) === QUESTION_TYPE.MCQ) {
        if (!requestData.options || !requestData.options.length)
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.MISSING_OPTIONS_FIELD,
            HTTP_CODES.BAD_REQUEST
          );
        for (let x of requestData.options) {
          if (!x.name || !x.option)
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.MISSING_OPTIONS_VALUE,
              HTTP_CODES.BAD_REQUEST
            );
        }
      }
      return this.userServiceObj.addQuestionService(requestData, userId);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getCategoryMasterController(requestData) {
    try {
      return this.userServiceObj.getCategoryService(requestData);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async uploadPhotoController(requestData) {
    try {
      if (
        !["question", "profile-photo", "post"].includes(requestData.entityType)
      ) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_ENTITY_TYPE,
          HTTP_CODES.BAD_REQUEST
        );
      }
      if (
        requestData.mimetype !== "image/png" &&
        requestData.mimetype !== "image/jpg" &&
        requestData.mimetype !== "image/jpeg" &&
        requestData.mimetype !== "video/mp4"
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_IMAGE_FORMAT,
          HTTP_CODES.BAD_REQUEST
        );
      else if (requestData.mimetype === "video/mp4") {
        return await this.userServiceObj.uploadVideoService(requestData);
      } else {
        if (!checkImageSize(requestData, 10))
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.MAXIMUM_FILE_SIZE,
            HTTP_CODES.BAD_REQUEST
          );
        return await this.userServiceObj.uploadImageService(requestData);
      }
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsOnCategoryController(
    requestData,
    userId,
    isOfficiallyVerified
  ) {
    try {
      const [notificationData, data, countVerification] = await Promise.all([
        this.userServiceObj.getNotificationCountService(userId),
        this.userServiceObj.getQuestionOnHomeService(requestData, userId),
        this.userServiceObj.getUserVerificationFormCount(userId),
      ]);
      const responseData = {};
      if (data.length) {
        responseData.data = data;
        responseData.total_count = data[0].total_count || 0;
      } else {
        responseData.data = [];
        responseData.total_count = 0;
      }
      responseData.notification_count =
        notificationData && notificationData.length && notificationData[0].count
          ? notificationData[0].count
          : 0;
      responseData.is_notification = +responseData.notification_count
        ? true
        : false;
      responseData.is_officially_verified = isOfficiallyVerified;
      responseData.is_verification_requested =
        countVerification &&
          countVerification.length &&
          countVerification[0].count > 0
          ? true
          : false;
      return responseData;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionOnDateController(requestData, userId) {
    try {
      if (!requestData.date)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_DATE_FIELD,
          HTTP_CODES.BAD_REQUEST
        );
      else if (isNaN(parseInt(requestData.date)))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_DATE,
          HTTP_CODES.BAD_REQUEST
        );
      else if (String(requestData.date).length !== 13)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.DATE_MUST_BE_MILISECONDS,
          HTTP_CODES.BAD_REQUEST
        );
      const data = await this.userServiceObj.getQuestionOnDateSerice(
        requestData,
        userId
      );
      if (parseInt(requestData.date) > getStartOfDay())
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.NOT_ALLOWED_DATE,
          HTTP_CODES.BAD_REQUEST
        );
      requestData.date = parseInt(requestData.date);
      if (
        !(
          requestData.date >= getPreviousYearDate() &&
          requestData.date <= getStartOfDay()
        )
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_DATE,
          HTTP_CODES.BAD_REQUEST
        );
      const responseData = {};
      const getUnreadCount =
        await this.userServiceObj.getNotificationCountService(userId);
      if (data.length) {
        responseData.data = data;
        responseData.total_count = data[0].total_count || 0;
        responseData.is_notification =
          getUnreadCount &&
            getUnreadCount.length &&
            parseInt(getUnreadCount[0].count)
            ? true
            : false;
      } else {
        responseData.data = [];
        responseData.total_count = 0;
        responseData.is_notification =
          getUnreadCount &&
            getUnreadCount.length &&
            parseInt(getUnreadCount[0].count)
            ? true
            : false;
      }
      return responseData;
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async forgotPasswordController(requestData) {
    try {
      requestData.type = Number(requestData.type);
      if (requestData.type === FORGOT_PASSWORD_TYPE.PHONE_NUMBER) {
        if (
          !requestData.country_code.includes("+") ||
          requestData.country_code.length > 3
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_COUNTRY_CODE,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (
          requestData.login_entity.length > 15 ||
          requestData.login_entity.length < 10
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_PHONE_NUMBER,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (requestData.login_entity.includes("@")) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_PHONE_NUMBER,
            HTTP_CODES.BAD_REQUEST
          );
        }
      } else if (requestData.type === FORGOT_PASSWORD_TYPE.EMAIL) {
        if (!requestData.login_entity.includes("@"))
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_EMAIL,
            HTTP_CODES.BAD_REQUEST
          );
        requestData.email = requestData.login_entity;
      }
      return await this.userServiceObj.forgotPasswordService(requestData);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async logoutController(userId, token, requestData) {
    try {
      if (!requestData.device_token)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_DEVICE_TOKEN,
          HTTP_CODES.BAD_REQUEST
        );
      else
        return await this.userServiceObj.logoutService(
          userId,
          token,
          requestData
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async resetPasswordController(requestData) {
    try {
      if (requestData.password !== requestData.confirm_password) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.PASSWORD_MISMATCH,
          HTTP_CODES.BAD_REQUEST
        );
      } else if (!checkPassword(requestData.password)) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_PASSWORD_FORMAT,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.resetPasswordService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async sendEmailVerificationController(requestData) {
    try {
      if (!requestData.email)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_EMAIL,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.sendEmailVerifcationService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getProfileDataController(userId) {
    try {
      return await this.userServiceObj.getProfileService(userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionDetailController(requestData, userId) {
    try {
      return await this.userServiceObj.getQuestionDetailsService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionDetails(questionIds) {
    try {
      return await this.userServiceObj.getQuestionsDetails(questionIds);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async postAnswerController(requestData, userId) {
    try {
      return await this.userServiceObj.postAnswerService(requestData, userId);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateProfileController(requestData, imageData, userId) {
    try {
      return await this.userServiceObj.updateProfileService(
        requestData,
        imageData,
        userId
      );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateBusinessProfileController(requestData, imageData, userId) {
    try {
      const userName = requestData.user_name && requestData.user_name.trim();
      if (userName) {
        const isValidUserName = checkValidUserName(userName);
        if (isValidUserName) {
          requestData.user_name = String(userName);
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.WRONG_USER_NAME,
            HTTP_CODES.BAD_REQUEST
          );
        }
      }

      if (!requestData.country_code)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_COUNTRY_CODE,
          HTTP_CODES.BAD_REQUEST
        );
      if (!requestData.phone_number)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_PHONE_NUMBER,
          HTTP_CODES.BAD_REQUEST
        );
      if (
        !requestData.country_code.includes("+") ||
        requestData.country_code.length > 3
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_COUNTRY_CODE,
          HTTP_CODES.BAD_REQUEST
        );
      if (
        requestData.phone_number.length > 15 ||
        requestData.phone_number.length < 10
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.PHONE_NUMBER_LENGTH,
          HTTP_CODES.BAD_REQUEST
        );
      if (requestData.bio && String(requestData.bio).length > 500)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MAXIMUM_LIMIT_BIO,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.updateBusinessProfileService(
        requestData,
        imageData,
        userId
      );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateAccountTypeController(requestData, userId) {
    try {
      return await this.userServiceObj.updateAccountTypeService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async skipSuggestedFriendController(userId) {
    try {
      return await this.userServiceObj.skipSuggestedFriendService(userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async shareQuestionController(requestData, userId) {
    try {
      if (requestData.question_id && !checkValidUUID(requestData.question_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_QUESTION_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.shareQuestionService(
        requestData,
        userId
      );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  commonErrorHandler(err) {
    if (
      err.parent &&
      err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
      err.fields &&
      err.fields.phone_number
    ) {
      err.statusCode = HTTP_CODES.BAD_REQUEST;
      err.errorMessage = ERROR_MESSSAGES.PHONE_ALREADY_EXISTS;
    } else if (
      err.parent &&
      err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
      err.fields &&
      err.fields.email
    ) {
      err.statusCode = HTTP_CODES.BAD_REQUEST;
      err.errorMessage = ERROR_MESSSAGES.EMAIL_ALREADY_EXISTS;
    } else if (
      err.parent &&
      err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
      err.fields &&
      err.fields.user_name
    ) {
      err.statusCode = HTTP_CODES.BAD_REQUEST;
      err.errorMessage = ERROR_MESSSAGES.USER_NAME_ALREADY_EXISTS;
    } else if (
      err.parent &&
      err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
      err.fields &&
      err.fields.device_token
    ) {
      err.statusCode = HTTP_CODES.BAD_REQUEST;
      err.errorMessage = ERROR_MESSSAGES.DEVICE_ALREADY_EXISTS;
    } else if (
      err.parent &&
      err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
      err.fields &&
      err.fields.question_id &&
      !err.fields.answer_id
    ) {
      err.statusCode = HTTP_CODES.BAD_REQUEST;
      err.errorMessage = ERROR_MESSSAGES.ALREADY_SHARED;
    } else if (
      err.parent &&
      err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
      err.fields &&
      err.fields.answer_id &&
      err.fields.question_id
    ) {
      err.statusCode = HTTP_CODES.BAD_REQUEST;
      err.errorMessage = ERROR_MESSSAGES.ALREADY_ANSWERED_SAME_OPTION;
    } else if (
      err.parent &&
      err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
      err.fields &&
      err.fields.otp
    ) {
      err.statusCode = HTTP_CODES.BAD_REQUEST;
      err.errorMessage = ERROR_MESSSAGES.OTP_MUST_UNIQUE;
    } else return;
  }

  async sendOtpReverifyController(requestData, userId) {
    try {
      if (
        requestData.phone_number &&
        (!requestData.country_code.includes("+") ||
          requestData.country_code.length > 3)
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_COUNTRY_CODE,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.reSendVerifyOtpService(
        requestData,
        userId
      );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async reVerifyController(requestData, userId) {
    try {
      if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.reVerifyOtpService(requestData, userId);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async viewOtherProfileController(requestData, userId) {
    try {
      let data;
      let elasticIds = [],
        _OElasticIds = [];
      let elasticDataFound = true;
      if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      const is_Blocked = await UserBlocksModel.findOne({
        where: {
          blocked_to: userId,
          blocked_by: requestData.user_id,
        },
      });
      if (is_Blocked)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.BLOCKED_OTHER_PROFILE,
          HTTP_CODES.BAD_REQUEST
        );
      // if (requestData.search || requestData.category_id) {
      //   data = await QuestionRepositoryObj.searchQuestion(
      //     requestData,
      //     requestData.user_id,
      //     userId
      //   );
      //   data = data.hits && data.hits.hits;
      //   if (data && data.length) {
      //     for (let x of data) {
      //       elasticIds.push(`'${x._id}'`);
      //       _OElasticIds.push(x._id);
      //     }
      //   } else {
      //     elasticDataFound = false;
      //   }
      // }
      const result = await this.userServiceObj.viewOtherUserProfileService(
        requestData,
        userId,
        elasticIds,
        elasticDataFound
      );
      if (!_OElasticIds.length) return result;
      //Maintaining the sequence
      let _activityDataMap = {},
        _activityData = [];
      if (result && Array.isArray(result.activity_data)) {
        result.activity_data.forEach((_obj) => {
          _activityDataMap[_obj.question_id] = _obj;
        });
      }
      if (_OElasticIds.length) {
        _OElasticIds.forEach((_id) => {
          _activityDataMap[_id] && _activityData.push(_activityDataMap[_id]);
        });
      }
      result && (result.activity_data = _activityData);
      return result;
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async viewOtherNewProfileController(requestData, userId) {
    try {
      let data;
      let elasticIds = [],
        _OElasticIds = [];
      let elasticDataFound = true;
      if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      const is_Blocked = await UserBlocksModel.findOne({
        where: {
          blocked_to: userId,
          blocked_by: requestData.user_id,
        },
      });
      if (is_Blocked)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.BLOCKED_OTHER_PROFILE,
          HTTP_CODES.BAD_REQUEST
        );
      // if (requestData.search || requestData.category_id) {
      //   data = await QuestionRepositoryObj.searchQuestion(
      //     requestData,
      //     requestData.user_id,
      //     userId
      //   );
      //   data = data.hits && data.hits.hits;
      //   if (data && data.length) {
      //     for (let x of data) {
      //       elasticIds.push(`'${x._id}'`);
      //       _OElasticIds.push(x._id);
      //     }
      //   } else {
      //     elasticDataFound = false;
      //   }
      // }
      const result = await this.userServiceObj.viewOtherNewUserProfileService(
        requestData,
        userId,
        elasticIds,
        elasticDataFound
      );
      if (!_OElasticIds.length) return result;
      //Maintaining the sequence
      let _activityDataMap = {},
        _activityData = [];
      if (result && Array.isArray(result.activity_data)) {
        result.activity_data.forEach((_obj) => {
          _activityDataMap[_obj.question_id] = _obj;
        });
      }
      if (_OElasticIds.length) {
        _OElasticIds.forEach((_id) => {
          _activityDataMap[_id] && _activityData.push(_activityDataMap[_id]);
        });
      }
      result && (result.activity_data = _activityData);
      return result;
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createFollowRequestController(requestData, userId) {
    try {
      if (userId === requestData.user_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (requestData.user_id && !checkValidUUID(requestData.user_id)) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      } else
        return await this.userServiceObj.createFollowRequestService(
          requestData,
          userId
        );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getMyActivityController(requestData, userId) {
    try {
      return await this.userServiceObj.getMyActivityDataService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getMyActivityNewController(requestData, userId) {
    try {
      return await this.userServiceObj.getMyActivityNewDataService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowRequests(requestData, userId) {
    try {
      return await this.userServiceObj.getFollowRequestService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowing(requestData, userId) {
    try {
      return await this.userServiceObj.getFollowingRequestService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowers(requestData, userId) {
    try {
      return await this.userServiceObj.getFollowersRequestService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async followRequestActionController(requestData, userId) {
    try {
      if (
        requestData.follow_request_id &&
        !checkValidUUID(requestData.follow_request_id)
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_FOLLOW_REQUEST_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.followRequestActionService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createDummyFollowerController(requestData) {
    try {
      if (requestData.followed_by && !checkValidUUID(requestData.followed_by)) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_FOLLOWED_BY_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
      if (requestData.followed_to && !checkValidUUID(requestData.followed_to)) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_FOLLOWED_TO_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.createDummyFollowerService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changePasswordController(requestData, userId) {
    try {
      if (requestData.password !== requestData.confirm_password)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.PASSWORD_MISMATCH,
          HTTP_CODES.BAD_REQUEST
        );
      else if (requestData.password === requestData.old_password)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.PASSWORD_SAME_AS_OLD,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.changePasswordService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFeedListingController(requestData, userId) {
    try {
      return await this.userServiceObj.getFeedListingService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteAccountController(userId) {
    try {
      return await this.userServiceObj.deleteAccountService(userId);
    } catch (err) {
      if (
        err.parent &&
        err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
        err.fields &&
        err.fields.user_id
      ) {
        err.statusCode = HTTP_CODES.BAD_REQUEST;
        err.errorMessage = ERROR_MESSSAGES.USER_ALREADY_DELETED;
      }
      Logger.error(new Error(err));
      throw err;
    }
  }

  async enableDisableNotificationSettingController(requestData, userId) {
    try {
      return await this.userServiceObj.enableDisableNotificationSettingService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getNotificationListController(requestData, userId) {
    try {
      return await this.userServiceObj.getNotificationListService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getBusinessCategoryMasterController() {
    try {
      return await this.userServiceObj.getBusinessCategoryMasterService();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  getMapController() {
    try {
      return this.userServiceObj.getMapDataService();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSearchPeopleController(requestData, userId) {
    try {
      return await this.userServiceObj.searchPeopleService(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async blockUserController(requestData, userId) {
    try {
      if (!requestData.user_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (!checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.blockUserService(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getBlockListController(requestData, userId) {
    try {
      return await this.userServiceObj.getBlockListService(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async unblockUserController(requestData, userId) {
    try {
      if (!requestData.block_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_BLOCK_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (!checkValidUUID(requestData.block_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_BLOCK_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.unBlockUserService(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async addCategoryController(requestData) {
    try {
      if (!checkValidUUID(requestData.category_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_CATEGORY_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.addCategoryService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getAllCategoryMasterList() {
    try {
      return await this.userServiceObj.getAllCategoryMasterList();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateMasterCategoryController(requestData) {
    try {
      if (!checkValidUUID(requestData.category_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_CATEGORY_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.updateCategoryMasterService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteMasterController(requestData) {
    try {
      if (!requestData.block_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_BLOCK_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (!checkValidUUID(requestData.category_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_CATEGORY_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.deleteCategoryMasterService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateSeenStatusController(requestData, userId) {
    try {
      if (!checkValidUUID(requestData.notification_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_NOTIFICATION_ID,
          HTTP_CODES.BAD_REQUEST
        );
      await this.userServiceObj.updateNotificationStatusService(requestData);
      return {
        unread_count: (
          await this.userServiceObj.getNotificationCountService(userId)
        )[0].count,
      };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkAndGetStatusController(requestData, userId) {
    try {
      if (!requestData.notification_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_NOTIFICATION_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (!checkValidUUID(requestData.notification_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_NOTIFICATION_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.checkAndGetStatusService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async addToSearchSuggestionController(requestData, userId) {
    try {
      if (!requestData.user_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.addToSearchSuggestionService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSearchSuggestionsController(userId) {
    try {
      return await this.userServiceObj.getSearchSuggestionService(userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFriendListController(requestData, userId) {
    try {
      if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      const data = await this.userServiceObj.getFriendListService(
        requestData,
        userId
      );
      if (data) {
        const allMutualFriend = data.mutualFriends.map((object) => {
          return { total_count: String(data.mutualFriends.length), ...object };
        });
        return {
          total_count_following: data.following.length
            ? data.following[0].total_count
            : 0,
          total_count_follows: data.follows.length
            ? data.follows[0].total_count
            : 0,
          total_count_mutual_friends: allMutualFriend.length
            ? String(allMutualFriend.length)
            : 0,
          data: {
            following: data.following,
            follows: data.follows,
            mutual_friends: allMutualFriend,
          },
        };
      } else
        return {
          total_count_following: 0,
          total_count_follows: 0,
          total_count_mutual_friends: 0,
          data: {
            following: [],
            follows: [],
            mutual_friends: [],
          },
        };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getConnectedProfilesController(userId, parentId) {
    try {
      return this.userServiceObj.getConnectedProfilesService(userId, parentId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async switchProfileController(requestData) {
    try {
      if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.switchProfileService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changeNumberController(requestData) {
    try {
      if (!requestData.user_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.changeNumberService(requestData);
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSuggestedFriendListController(requestData, userId) {
    try {
      const data = await this.userServiceObj.getSuggestedFriendListService(
        requestData,
        userId
      );
      if (data && data.data && data.data.length) {
        return { total_count: data.total_count || 0, data: data.data };
      } else {
        return { total_count: 0, data: [] };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async enableDisableContactsSyncingController(requestData, userId) {
    try {
      return await this.userServiceObj.enableDisableContactsSyncingService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async removeSuggestedFriendController(requestData, userId) {
    try {
      if (!requestData.user_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else if (requestData.user_id && !checkValidUUID(requestData.user_id))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.removeSuggestedFriendService(
        requestData,
        userId
      );
    } catch (err) {
      if (err.parent && err.parent.code === ORM_ERRORS.ALREADY_EXISTS) {
        err.statusCode = HTTP_CODES.BAD_REQUEST;
        err.errorMessage = ERROR_MESSSAGES.ALREADY_REMOVED;
      }
      Logger.error(new Error(err));
      throw err;
    }
  }

  //toggleGenderController
  async toggleGenderController(requestData, userId) {
    try {
      return await this.userServiceObj.toggleGenderService(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //search user controller
  async getSearchUserController(requestData, userId) {
    try {
      return await this.userServiceObj.searchUserService(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //subscribeToUser
  async subscribeToUserController(requestData, userId) {
    try {
      if (
        requestData.subscribed_to &&
        !checkValidUUID(requestData.subscribed_to)
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_SUBSCRIBED_TO,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.subscribeToUserService(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async reportuserController(requestData, userId) {
    try {
      if (requestData.reported_to && !checkValidUUID(requestData.reported_to))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_REPORTED_ID,
          HTTP_CODES.BAD_REQUEST
        );
      if (!requestData.report_reason_id && !requestData.other_reason) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_REPORT_REASON,
          HTTP_CODES.BAD_REQUEST
        );
      } else if (
        requestData.report_reason_id &&
        !checkValidUUID(requestData.report_reason_id)
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_REPORTED_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.reportUserService(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUnreadCountController(userId) {
    try {
      const unreadCount = await this.userServiceObj.getNotificationCountService(
        userId
      );
      return unreadCount && unreadCount.length
        ? { unread_count: unreadCount[0].count }
        : { unread_count: 0 };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateSubscriptionController(requestData, userId) {
    try {
      if (!requestData.subscription)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_SUBSCRIPTION_VALUE,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.userServiceObj.updateSubscriptionService(
        requestData,
        userId
      );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async kycVerifyController(requestData, userId) {
    try {
      if (!requestData.name) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_NAME,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.kycVerifyService(requestData, userId);
    } catch (err) {
      throw new ErrorHandler().customError(
        err.response.data.errorMessage,
        err.response.data.status
      );
    }
  }

  async getKycVerifyController(requestData) {
    try {
      if (!requestData.uniqueID) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_UNIQUE_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.getKycVerifyService(requestData);
    } catch (err) {
      throw new ErrorHandler().customError(
        err.response.data.errorMessage,
        err.response.data.status
      );
    }
  }

  async kycVerifyEditController(requestData) {
    try {
      if (!requestData.is_kyc_verified) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_REDIRECT_URL,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.kycVerifyEditService(requestData);
    } catch (err) {
      throw new ErrorHandler().customError(
        err.response.data.errorMessage,
        err.response.data.status
      );
    }
  }

  async kycVerifyStatusController(requestData, userId) {
    try {
      if (!requestData.is_kyc_verified) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_KYC_STATUS,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.userServiceObj.kycVerifyStatusService(
        requestData,
        userId
      );
    } catch (err) {
      this.commonErrorHandler(err);
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsImages(questionIds) {
    try {
      return await this.userServiceObj.getQuestionsImages(questionIds);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsCategories(categoryIds) {
    try {
      return await this.userServiceObj.getQuestionsCategories(categoryIds);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUsersBriefInfo(userIds) {
    try {
      return await this.userServiceObj.getUsersBriefInfo(userIds);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async myLikeStatus(userId, questionIds, sharedQuestionIds) {
    try {
      return await this.userServiceObj.myLikeStatus(
        userId,
        questionIds,
        sharedQuestionIds
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async myVoteStatus(userId, questionIds) {
    try {
      return await this.userServiceObj.myVoteStatus(
        userId,
        questionIds,
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // async getUserGoogleUrlController() {
  //   try {
  //     return await this.userServiceObj.getUserGoogleUrlServices();
  //   }
  //   catch (err) {
  //     Logger.error(new Error(err))
  //     throw err;
  //   }
  // }

  // async userGoogleTokenController(requestData) {
  //   try {
  //     return await this.userServiceObj.userGoogleTokenServices(requestData);
  //   }
  //   catch (err) {
  //     Logger.error(new Error(err))
  //     throw err;
  //   }
  // }
}

module.exports = UserController;
