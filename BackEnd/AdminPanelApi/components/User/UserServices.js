const UserRepository = require("./UserRepository");
const { v4: uuidv4 } = require("uuid");
const Bcrypt = require("bcryptjs");
const {
  SALT_ROUNDS,
  ROLE_IDS,
  ACCOUNT_TYPE,
  HTTP_CODES,
  ERROR_MESSSAGES,
  LOGIN_TYPE,
  SIGNUP_TYPE,
} = require("../../utils/Constants");
const { generateOtp } = require("../../utils/CommonFunctions");
const Twilio = require("../../helpers/Twilio");
const ErrorHandler = require("../../helpers/ErrorHandler");
const JWT = require("../../middilewares/Jwt");
const CommonFunctions = require("../../utils/CommonFunctions");
const SocialSignupMethods = require("../../helpers/SocialLogin");
const Logger = require("../../helpers/Logger");
const PromisePool = require("@supercharge/promise-pool");
const AwsS3Functions = require("../../awsfunctions");
const {
  getCypherToken,
  getUserIdFromToken,
} = require("../../helpers/CryptoFunctions");
require("dotenv-safe").config();
const SendGrid = require("../../helpers/SendGrid");

class UserServices {
  constructor() {
    this.UserRepositoryObj = new UserRepository();
  }

  async loginService(requestData) {
    try {
      const loginData = await this.UserRepositoryObj.findByEmail(
        requestData.email.toLowerCase()
      );
      if (loginData && loginData.dataValues) {
        requestData.user_id = loginData.dataValues.user_id;
        if (!loginData.dataValues.is_active) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INACTIVE_ACCOUNT,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (loginData.dataValues.role !== ROLE_IDS.ADMIN) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ONLY_ADMIN_IS_SUCCESS,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (
          Bcrypt.compareSync(
            requestData.password,
            loginData.dataValues.password
          )
        ) {
          loginData.dataValues.token = new JWT().generateToken(
            loginData.dataValues.user_id
          );
          return loginData.dataValues;
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_PASSWORD,
            HTTP_CODES.BAD_REQUEST
          );
        }
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_EMAIL_OR_PHONE,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async saveDeviceToken(savedDeviceData) {
    try {
      const userDeviceData = {
        user_device_id: uuidv4(),
        device_token: savedDeviceData.device_token,
        device_type: savedDeviceData.device_type,
        user_id: savedDeviceData.user_id,
      };
      await this.UserRepositoryObj.saveUserDevices(userDeviceData);
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async addQuestionService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.addQuestions(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getCategoryService() {
    try {
      return await this.UserRepositoryObj.getAllCatgeories();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async uploadImageService(requestData) {
    try {
      const imageUrl = await AwsS3Functions.uploadToS3(
        requestData,
        `questions`,
        requestData.filename
      );
      return imageUrl.Location;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionOnHomeService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.getQuestionsOnCategories(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getInfo() {}

  async forgotPasswordService(requestData) {
    try {
      const adminData = await this.UserRepositoryObj.findByEmail(
        requestData.email.toLowerCase()
      );
      if (adminData && adminData.dataValues) {
        if (!adminData.dataValues.is_active) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INACTIVE_ACCOUNT,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (adminData.dataValues.role !== ROLE_IDS.ADMIN) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ONLY_ADMIN_IS_SUCCESS
          );
        }
        const data = await this.sendForgotPasswordEmail(adminData);
        return data;
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_EMAIL_OR_PHONE,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async sendForgotPasswordEmail(adminData) {
    try {
      let emailResetToken;
      if (adminData.dataValues.reset_password_token) {
        emailResetToken = adminData.dataValues.reset_password_token;
      } else {
        emailResetToken = getCypherToken(adminData.dataValues.user_id);
      }
      await this.UserRepositoryObj.updateResetPasswordToken(
        emailResetToken,
        adminData.dataValues.user_id
      );
      const link = `${process.env.PASSWORD_RESET_URL}?token=${emailResetToken}`;
      const emailData = {
        templateData: { link: link },
        templateId: process.env.RESET_PASSWORD_TEMPLATE_ID,
        toEmail: adminData.dataValues.email,
      };
      new SendGrid().sendMail(emailData);
      return link;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async resetPasswordService(requestData) {
    try {
      const userId = getUserIdFromToken(requestData.token);
      const userData = await this.UserRepositoryObj.findDataByUserId(userId);
      if (userData) {
        if (!userData.dataValues.is_active) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.UNABLE_TO_RESET_PASSWORD,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (!userData.dataValues.reset_password_token) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.RESET_PASSWORD_LINK_EXPIRED,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (
          userData.dataValues.reset_password_token !== requestData.token
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.UNABLE_TO_VERIFY_TOKEN,
            HTTP_CODES.BAD_REQUEST
          );
        } else {
          const newPassword = Bcrypt.compareSync(
            requestData.password,
            userData.dataValues.password
          );
          if (newPassword) {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.ADD_UPDATED_PASSWORD,
              HTTP_CODES.BAD_REQUEST
            );
          } else {
            const password = Bcrypt.hashSync(requestData.password, SALT_ROUNDS);
            await this.UserRepositoryObj.updateProfileData(
              {
                password: password,
                updated_at: Date.now(),
                reset_password_token: null,
              },
              userId
            );
            return;
          }
        }
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.UNABLE_TO_VERIFY_TOKEN,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  }

  async logoutService(userId, token) {
    try {
      const savedData = {
        user_id: userId,
        created_at: Date.now(),
        token: token,
        expired_jwt_id: uuidv4(),
      };
      await this.UserRepositoryObj.insertIntoExpiredJwt(savedData);
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async removeQuestionService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.deleteQuestions(
        requestData,
        userId
      );
      if (data && data.length && data[0]) return;
      else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.UNABLE_TO_REMOVE_QUESTION,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async verifyEmailService(requestData) {
    try {
      const userId = getUserIdFromToken(requestData.token);
      const userData = await this.UserRepositoryObj.findDataByUserId(userId);
      if (userData) {
        if (!userData.dataValues.is_active) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.UNABLE_TO_VERIFY_EMAIL,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (!userData.dataValues.email_verification_token) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.EMAIL_VERIFICATION_EXPIRED,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (
          userData.dataValues.email_verification_token !== requestData.token
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.UNABLE_TO_VERIFY_TOKEN,
            HTTP_CODES.BAD_REQUEST
          );
        } else {
          if (!userData.dataValues.temp_email)
            await this.UserRepositoryObj.updateProfileData(
              {
                is_email_verified: true,
                updated_at: Date.now(),
                email_verification_token: null,
                is_active: true,
              },
              userId
            );
          else if (userData.dataValues.temp_email)
            await this.UserRepositoryObj.updateProfileData(
              {
                is_email_verified: true,
                updated_at: Date.now(),
                email_verification_token: null,
                email: userData.dataValues.temp_email.toLowerCase(),
              },
              userId
            );
          return;
        }
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.UNABLE_TO_VERIFY_TOKEN,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  }

  async updateQuestionService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.updateQuestions(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async profileActionService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.profileAction(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteSuspendService(requestData) {
    try {
      return await this.UserRepositoryObj.deleteSuspendAction(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionDetailsService(requestData) {
    try {
      const [questionData, questionAnswerData, countData] = await Promise.all([
        this.UserRepositoryObj.getQuestionDetails(requestData),
        this.UserRepositoryObj.getQuestionOptionDetails(requestData),
        this.UserRepositoryObj.getStateAndCountyCount(requestData.question_id),
      ]);
      if (!questionData.length || !questionAnswerData.length)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_QUESTION_ID,
          HTTP_CODES.BAD_REQUEST
        );
      return {
        question_data: questionData[0],
        options: questionAnswerData,
        state_county_count: countData,
      };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSubmissionListService(requestData) {
    try {
      return await this.UserRepositoryObj.getQuestionSubmissionList(
        requestData
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserDetailService(requestData) {
    try {
      const data = await this.UserRepositoryObj.getUserDetails(requestData);
      if (data.length) {
        let genderString = data[0].gender;
        if (genderString == "0") genderString = "Male";
        else if (genderString == "1") genderString = "Female";
        else if (genderString == "2") genderString = "Prefer not to say";
        else if (genderString == "3") genderString = "Other";

        const userDetails = {
          first_name: data[0].first_name,
          last_name: data[0].last_name,
          full_name: data[0].full_name,
          email: data[0].email,
          phone_number: data[0].phone_number,
          date_of_birth: data[0].date_of_birth,
          county: data[0].county,
          state: data[0].state,
          city: data[0].city,
          user_name: data[0].user_name,
          gender: genderString,
          bio: data[0].bio,
          website: data[0].website,
          address: data[0].address,
          title: data[0].title,
          profile_picture: data[0].profile_picture,
        };
        return userDetails;
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      console.log(err)
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserVerificationFormDetailService(requestData) {
    try {
      const data = await this.UserRepositoryObj.getUserVerificationFormDetails(
        requestData
      );
      if (data) return data;
      else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserListService(requestData) {
    try {
      const data = await this.UserRepositoryObj.getUsersList(requestData);
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
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getVerificationFormListService(requestData) {
    try {
      const data = await this.UserRepositoryObj.getVerificationFormList(
        requestData
      );
      const responseData = {};
      responseData.data = data.rows;
      responseData.total_count = data.count;
      return responseData;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }
}

module.exports = UserServices;
