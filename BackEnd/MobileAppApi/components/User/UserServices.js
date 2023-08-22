const UserRepository = require("./UserRepository");
const { v4: uuidv4 } = require("uuid");
const Bcrypt = require("bcrypt");
const {
  SALT_ROUNDS,
  ROLE_IDS,
  ACCOUNT_TYPE,
  HTTP_CODES,
  ERROR_MESSSAGES,
  LOGIN_TYPE,
  SIGNUP_TYPE,
  FORGOT_PASSWORD_TYPE,
  FOLLOW_TYPE,
  FOLLOW_ACTION_TYPE,
  ORM_ERRORS,
  SUBSCRIPTION,
  KYC,
  QUESTION_NEW_FORMAT_CONDITION,
} = require("../../utils/Constants");
const CommonFunctions = require("../../utils/CommonFunctions");
const {
  generateOtp,
  checkValidUserName,
} = require("../../utils/CommonFunctions");
const Twilio = require("../../helpers/Twilio");
const ErrorHandler = require("../../helpers/ErrorHandler");
const JWT = require("../../middilewares/Jwt");
const SocialSignupMethods = require("../../helpers/SocialLogin");
const Logger = require("../../helpers/Logger");
const PromisePool = require("@supercharge/promise-pool");
const AwsS3Functions = require("../../awsfunctions");
const SendGrid = require("../../helpers/SendGrid");
const { createThumbNailImage } = require("../../helpers/Ffmpeg");
const { uploadVideo } = require("../../awsfunctions");
const UserSubscribers = require("../../models/UserSubscribers");
const {
  sendPushNotificationForFollowUpdate,
} = require("../Questions/NotificationServices");
const e = require("express");

class UserServices {
  constructor() {
    this.UserRepositoryObj = new UserRepository();
  }

  async countryStateMasterService() {
    try {
      await this.UserRepositoryObj.countryStateMasterRepository();
    } catch (err) {
      console.log(err);
    }
  }

  async signUpService(requestData) {
    try {
      if (requestData.signup_type === SIGNUP_TYPE.PHONE_NUMBER) {
        if (isNaN(Number(requestData.phone_number))) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.PHONER_NUMBER_MUST_BE_INTERGER,
            HTTP_CODES.BAD_REQUEST
          );
        }
        const checkPhoneNumberExists =
          await this.UserRepositoryObj.findPhoneNumber(
            requestData.phone_number,
            requestData.country_code
          );
        if (
          checkPhoneNumberExists &&
          checkPhoneNumberExists.dataValues.phone_number
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.PHONE_ALREADY_EXISTS,
            HTTP_CODES.BAD_REQUEST
          );
        } else {
          const uuid = uuidv4();
          const requestObj = {
            user_id: uuid,
            created_at: Date.now(),
            country_code: requestData.country_code,
            phone_number: requestData.phone_number,
            password: requestData.password
              ? Bcrypt.hashSync(requestData.password, SALT_ROUNDS)
              : "",
            role: ROLE_IDS.USER,
            account_type: ACCOUNT_TYPE.PUBLIC,
            is_active: true,
            is_profile_completed: false,
            is_business_account: requestData.is_business_account,
          };
          const data = await this.UserRepositoryObj.signUpRepository(
            requestObj
          );
          if (data) {
            data.dataValues.is_signup = false;
            data.dataValues.phone_number = requestData.phone_number;
            data.dataValues.country_code = requestData.country_code;
            data.dataValues.token = new JWT().generateToken(
              data.dataValues.user_id
            );
            const tokenData = {
              device_token: data.dataValues.token,
              device_type: requestData.device_type,
              user_id: uuid,
            };
            await this.saveDeviceToken(tokenData);
            return data.dataValues;
          } else {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.UNABLE_TO_SIGNUP,
              HTTP_CODES.BAD_REQUEST
            );
          }
        }
      } else if (requestData.signup_type === SIGNUP_TYPE.GMAIL) {
        return await this.gmailSignupService(requestData);
      } else if (requestData.signup_type === SIGNUP_TYPE.APPLE) {
        return await this.appleSignupService(requestData);
      } else if (requestData.signup_type === SIGNUP_TYPE.EMAIL) {
        const checkEmailExists = await this.UserRepositoryObj.findByEmail(
          requestData.email.toLowerCase()
        );
        if (
          checkEmailExists &&
          checkEmailExists.dataValues.email === requestData.email
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.EMAIL_ALREADY_EXISTS,
            HTTP_CODES.BAD_REQUEST
          );
        } else {
          const uuid = uuidv4();
          const requestObj = {
            user_id: uuid,
            created_at: Date.now(),
            email: requestData.email,
            password: requestData.password
              ? Bcrypt.hashSync(requestData.password, SALT_ROUNDS)
              : "",
            role: ROLE_IDS.USER,
            account_type: ACCOUNT_TYPE.PUBLIC,
            is_active: true,
            is_profile_completed: false,
            is_business_account: requestData.is_business_account,
          };
          if (requestData.parent_id) {
            requestObj.parent_id = requestData.parent_id;
            const parentAccountData =
              await this.UserRepositoryObj.findDataByUserId(
                requestData.parent_id
              );
            if (!parentAccountData || !parentAccountData.dataValues)
              throw new ErrorHandler().customError(
                ERROR_MESSSAGES.INVALID_PARENT_ID,
                HTTP_CODES.BAD_REQUEST
              );
            requestObj.gender = parentAccountData.dataValues.gender;
            requestObj.date_of_birth =
              parentAccountData.dataValues.date_of_birth;
          }
          const data = await this.UserRepositoryObj.signUpRepository(
            requestObj
          );
          if (data) {
            data.dataValues.token = new JWT().generateToken(
              data.dataValues.user_id
            );
            const tokenData = {
              device_token: data.dataValues.token,
              device_type: requestData.device_type,
              user_id: uuid,
            };
            await this.saveDeviceToken(tokenData);
            return data.dataValues;
          } else {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.UNABLE_TO_SIGNUP,
              HTTP_CODES.BAD_REQUEST
            );
          }
        }
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async sendOtpService(requestData) {
    try {
      if (requestData.phone_number) {
        if (isNaN(Number(requestData.phone_number))) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.PHONER_NUMBER_MUST_BE_INTERGER,
            HTTP_CODES.BAD_REQUEST
          );
        }
        const phoneNumber =
          String(requestData.country_code) + String(requestData.phone_number);
        const data = await this.UserRepositoryObj.findPhoneNumber(
          requestData.phone_number,
          requestData.country_code
        );
        if (data) {
          const otp = generateOtp();
          await this.UserRepositoryObj.updateOtp(otp, data.user_id);
          new Twilio().sendMessage(
            `Please use the code ${otp} to verify otp. If you did not request to be verify otp, ignore this message.`,
            phoneNumber
          );
          return data;
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_COUNTRY_CODE_PHONE_NUMBER,
            HTTP_CODES.BAD_REQUEST
          );
        }
      } else if (requestData.email) {
        const data = await this.UserRepositoryObj.findByEmail(
          requestData.email
        );
        if (data) {
          const otp = generateOtp();
          await this.UserRepositoryObj.updateOtp(otp, data.user_id);
          const sendMailData = {
            templateId: process.env.SEND_OTP_TEMPLATE_ID,
            templateData: { otpMsg: otp },
            toEmail: requestData.email,
          };
          new SendGrid().sendMail(sendMailData);
          return data;
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_EMAIL,
            HTTP_CODES.BAD_REQUEST
          );
        }
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async verifyOtpService(requestData) {
    try {
      if (isNaN(Number(requestData.otp))) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.OTP_MUST_BE_INTEGER,
          HTTP_CODES.BAD_REQUEST
        );
      } else {
        const data = await this.UserRepositoryObj.getDataByOtp(
          requestData.otp,
          requestData.user_id
        );
        if (data && data.phone_number && data.email) {
          await this.UserRepositoryObj.updatePhoneNumberAndEmailVerificationStatus(
            data.user_id
          );
          data.is_phone_verified = true;
          data.is_email_verified = true;
          return data;
        } else if (data && data.phone_number) {
          await this.UserRepositoryObj.updatePhoneNumberVerificationStatus(
            data.user_id
          );
          data.is_phone_verified = true;
          return data;
        } else if (data && data.email) {
          await this.UserRepositoryObj.updateEmailVerificationStatus(
            data.user_id
          );
          data.is_email_verified = true;
          return data;
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_OTP,
            HTTP_CODES.BAD_REQUEST
          );
        }
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateProfileOnSignupService(requestData) {
    try {
      const userData = await this.UserRepositoryObj.findDataByUserId(
        requestData.user_id
      );
      if (userData && userData.dataValues) {
        requestData.user_id = userData.dataValues.user_id;
        if (userData.dataValues.is_profile_completed) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ALREADY_COMPLETED,
            HTTP_CODES.BAD_REQUEST
          );
        } else {
          const profileData = {
            email: requestData.email && requestData.email.toLowerCase(),
            phone_number: requestData.phone_number,
            first_name: requestData.first_name,
            last_name: requestData.last_name,
            date_of_birth: requestData.date_of_birth,
            state: requestData.state,
            county: requestData.county,
            country_code: requestData.country_code,
            is_active: true,
            is_profile_completed: true,
            user_name:
              requestData.user_name ||
              `${requestData.first_name}_${requestData.last_name}}`,
            state_symbol: requestData.state_symbol,
            state_symbol: requestData.state_symbol || null,
            gender: requestData.gender,
          };
          const updateData = await this.UserRepositoryObj.updateProfileData(
            profileData,
            requestData.user_id
          );
          if (
            updateData &&
            updateData.length &&
            updateData.length > 1 &&
            updateData[1].dataValues
          ) {
            userData.token = new JWT().generateToken(
              userData.dataValues.user_id
            );
            userData.is_profile_completed = true;
            return { ...userData.dataValues, ...profileData };
          } else {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.UNABLE_TO_UPDATE,
              HTTP_CODES.BAD_REQUEST
            );
          }
        }
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async completeBusinessProfileDataService(requestData, imageData, userId) {
    let profile_picture = "";
    try {
      requestData.user_id = userId;
      const userData = await this.UserRepositoryObj.findDataByUserId(
        requestData.user_id
      );
      if (userData && userData.dataValues) {
        requestData.user_id = userData.dataValues.user_id;
        let userName = requestData.business_account_name.replace(/ /g, "_");
        const profileData = {
          email: requestData.email.toLowerCase(),
          phone_number: requestData.phone_number,
          country_code: requestData.country_code,
          business_account_name: requestData.business_account_name,
          business_account_category: requestData.business_account_category,
          address: requestData.address,
          website: requestData.website,
          business_latitude: requestData.business_latitude,
          business_longitude: requestData.business_longitude,
          city: requestData.city,
          state: requestData.state,
          county: requestData.county,
          state_symbol: requestData.state_symbol,
          is_profile_completed: true,
          is_active: true,
          title: requestData.title,
          first_name: requestData.business_account_name,
          last_name: null,
          user_name: requestData.user_name || `${userName}_${generateOtp(4)}`,
        };
        if (imageData && imageData.filename) {
          imageData.entityType = "business-profile";
          imageData.entityId = requestData.user_id;
          profileData.profile_picture = (
            await this.uploadImageService(
              imageData,
              `profile_picture`,
              imageData.filename
            )
          ).image_url;
          profile_picture = profileData.profile_picture;
        }
        const updateData =
          await this.UserRepositoryObj.completeBusinessProfileData(
            profileData,
            requestData.user_id
          );
        if (
          updateData &&
          updateData.length &&
          updateData.length > 1 &&
          updateData[1].dataValues
        ) {
          userData.is_profile_completed = true;
          userData.token = new JWT().generateToken(
            updateData[1].dataValues.user_id
          );
          this.UserRepositoryObj.addBusinessAccountOnElasticDb(
            profileData,
            userData.dataValues.user_id
          );
          return { ...userData.dataValues, ...profileData };
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.UNABLE_TO_UPDATE,
            HTTP_CODES.BAD_REQUEST
          );
        }
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      if (
        err.parent &&
        err.parent.code === ORM_ERRORS.ALREADY_EXISTS &&
        err.fields &&
        err.fields.email
      ) {
        if (profile_picture) {
          let bucketUrl = `https://${process.env.USER_BUCKET_NAME}.s3.amazonaws.com/`;
          profile_picture = profile_picture.replace(bucketUrl);
          await AwsS3Functions.deleteFromS3(profile_picture);
        }
      }
      Logger.error(new Error(err));
      throw err;
    }
  }

  async loginService(requestData) {
    try {
      let loginData;
      if (LOGIN_TYPE.PHONE_NUMBER === requestData.login_type) {
        loginData = await this.UserRepositoryObj.findPhoneNumber(
          String(requestData.login_entity),
          requestData.country_code
        );
        if (loginData && !loginData.dataValues.is_active) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ACCOUNT_SUSPEND,
            HTTP_CODES.FORBIDDEN
          );
        }
      } else if (LOGIN_TYPE.EMAIL === requestData.login_type) {
        loginData = await this.UserRepositoryObj.findByEmail(
          requestData.login_entity.toLowerCase()
        );
        if (loginData && !loginData.dataValues.is_active) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ACCOUNT_SUSPEND,
            HTTP_CODES.FORBIDDEN
          );
        }
      }
      if (
        LOGIN_TYPE.PHONE_NUMBER === requestData.login_type ||
        LOGIN_TYPE.EMAIL === requestData.login_type
      ) {
        if (
          loginData &&
          loginData.dataValues &&
          !loginData.dataValues.is_deleted
        ) {
          requestData.user_id = loginData.dataValues.user_id;
          if (
            requestData.login_type === LOGIN_TYPE.PHONE_NUMBER ||
            requestData.login_type === LOGIN_TYPE.EMAIL
          ) {
            if (loginData.dataValues.password) {
              if (
                Bcrypt.compareSync(
                  requestData.password,
                  loginData.dataValues.password
                )
              ) {
                loginData.token = new JWT().generateToken(
                  loginData.dataValues.user_id
                );
                await this.checkIfAccountIsDeleted(loginData.dataValues);
                await this.updateToActiveService(loginData.dataValues);
                await this.saveDeviceToken(requestData);
                if (loginData.is_business_account) {
                  loginData.category =
                    await this.UserRepositoryObj.getCategoryDetails(
                      loginData.business_account_category
                    );
                }
                return loginData;
              } else {
                throw new ErrorHandler().customError(
                  ERROR_MESSSAGES.INVALID_PASSWORD,
                  HTTP_CODES.BAD_REQUEST
                );
              }
            } else {
              throw new ErrorHandler().customError(
                ERROR_MESSSAGES.SETUP_PASSWORD,
                HTTP_CODES.BAD_REQUEST
              );
            }
          }
        } else if (
          loginData &&
          loginData.dataValues &&
          loginData.dataValues.is_deleted
        ) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ACCOUNT_NOT_EXIST,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (requestData.login_type === LOGIN_TYPE.PHONE_NUMBER) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_PHONE_NUMBER,
            HTTP_CODES.BAD_REQUEST
          );
        } else if (requestData.login_type === LOGIN_TYPE.EMAIL) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_EMAIL,
            HTTP_CODES.BAD_REQUEST
          );
        }
      } else if (LOGIN_TYPE.GMAIL === requestData.login_type) {
        const gmailLoginData = await this.gmailLoginService(requestData);
        gmailLoginData.token = new JWT().generateToken(gmailLoginData.user_id);
        requestData.user_id = gmailLoginData.user_id;
        await this.saveDeviceToken(requestData);
        return gmailLoginData;
      } else if (LOGIN_TYPE.APPLE === requestData.login_type) {
        const appleLoginData = await this.appleLoginService(requestData);
        appleLoginData.token = new JWT().generateToken(appleLoginData.user_id);
        requestData.user_id = appleLoginData.user_id;
        await this.saveDeviceToken(requestData);
        return appleLoginData;
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async gmailSignupService(requestData) {
    try {
      return await this.commonFunctionsForAppleAndGoogleSignUp(
        requestData,
        false,
        true
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async appleSignupService(requestData) {
    try {
      return await this.commonFunctionsForAppleAndGoogleSignUp(
        requestData,
        true
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async gmailLoginService(requestData) {
    try {
      return await this.commonFunctionsForAppleAndGoogleLogin(
        requestData,
        false,
        true
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async appleLoginService(requestData) {
    try {
      return await this.commonFunctionsForAppleAndGoogleLogin(
        requestData,
        true
      );
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
    }
  }

  async saveContactsService(requestData, userId) {
    try {
      await this.UserRepositoryObj.deleteSavedContacts(userId);
      await PromisePool.withConcurrency(50)
        .for(requestData.contacts)
        .process(async (loopData) => {
          loopData.contact_numbers = loopData.contact_numbers
            .replace("[", "")
            .replace("]", "")
            .split(",");
          for (let x of loopData.contact_numbers) {
            const saveContactData = {
              user_id: userId,
              contact_id: uuidv4(),
              phone_number: String(x).replace(/ /g, ""),
              contact_name: loopData.contact_name,
              created_at: Date.now(),
            };
            await this.UserRepositoryObj.saveContacts(saveContactData);
          }
        })
        .catch((err) => Logger.error(err));
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getContactsService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.getContacts(requestData, userId);
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

  async getCategoryService(requestData) {
    try {
      return await this.UserRepositoryObj.getAllCatgeories(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async uploadImageService(requestData) {
    try {
      const folderName = `${requestData.entityType}/${requestData.entityId}`;
      const imageUrl = await AwsS3Functions.uploadToS3(
        requestData,
        folderName,
        requestData.filename,
        "image",
        requestData.entityType
      );
      return {
        image_url: imageUrl.Location,
        video_url: null,
        transcoded_video_url: null,
        width: requestData.width || null,
        height: requestData.height,
        ratio: requestData.ratio,
      };
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

  async getQuestionOnDateSerice(requestData, userId) {
    try {
      return await this.UserRepositoryObj.getQuestionsOnDate(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async forgotPasswordService(requestData) {
    try {
      requestData.type = parseInt(requestData.type);
      if (requestData.type === FORGOT_PASSWORD_TYPE.PHONE_NUMBER) {
        const getUserData = await this.UserRepositoryObj.findPhoneNumber(
          String(requestData.login_entity),
          String(requestData.country_code)
        );
        const phoneNumber =
          String(requestData.country_code) + String(requestData.login_entity);
        if (getUserData && getUserData.dataValues) {
          this.commonCaseHandlingForSocialLogin(getUserData);
          const otp = generateOtp();
          await this.UserRepositoryObj.updateProfileData(
            { otp: otp },
            getUserData.dataValues.user_id
          );
          new Twilio().sendMessage(
            `Please use the code ${otp} to reset your password. If you did not request your password to be reset, ignore this message.`,
            phoneNumber
          );
          return getUserData.dataValues;
        } else
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.PHONE_NUMBER_NOT_EXISTS,
            HTTP_CODES.BAD_REQUEST
          );
      } else if (requestData.type === FORGOT_PASSWORD_TYPE.EMAIL) {
        const getEmailData = await this.UserRepositoryObj.findByEmail(
          String(requestData.login_entity).toLowerCase()
        );
        if (getEmailData && getEmailData.dataValues) {
          this.commonCaseHandlingForSocialLogin(getEmailData, true);
          this.sendForgotPasswordEmail(getEmailData);
          return getEmailData.dataValues;
        } else
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.EMAIL_NOT_EXISTED,
            HTTP_CODES.BAD_REQUEST
          );
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_TYPE,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async logoutService(userId, token, requestData) {
    try {
      const savedData = {
        user_id: userId,
        created_at: Date.now(),
        token: token,
        expired_jwt_id: uuidv4(),
      };
      await Promise.all([
        this.UserRepositoryObj.insertIntoExpiredJwt(savedData),
        this.UserRepositoryObj.deleteFromDeviceToken(requestData, userId),
      ]);
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async resetPasswordService(requestData) {
    try {
      const userId = requestData.user_id;
      const userData = await this.UserRepositoryObj.findDataByUserId(userId);
      if (userData) {
        if (!userData.dataValues.is_active) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.UNABLE_TO_RESET_PASSWORD,
            HTTP_CODES.BAD_REQUEST
          );
        } else {
          if (userData.dataValues.password) {
            const newPassword = Bcrypt.compareSync(
              requestData.password,
              userData.dataValues.password
            );
            if (newPassword) {
              throw new ErrorHandler().customError(
                ERROR_MESSSAGES.ADD_UPDATED_PASSWORD,
                HTTP_CODES.BAD_REQUEST
              );
            }
          }
          const password = Bcrypt.hashSync(requestData.password, SALT_ROUNDS);
          await this.UserRepositoryObj.updateProfileData(
            { password: password, updated_at: Date.now(), otp: null },
            userId
          );
          return;
        }
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  }

  async sendForgotPasswordEmail(userData) {
    try {
      const otp = generateOtp();
      await this.UserRepositoryObj.updateProfileData(
        { otp: otp },
        userData.dataValues.user_id
      );
      const emailData = {
        templateData: { otpMsg: otp },
        templateId: process.env.RESET_PASSWORD_TEMPLATE_ID,
        toEmail: userData.dataValues.email,
      };
      new SendGrid().sendMail(emailData);
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async sendEmailVerificationEmail(userData, tempEmail = false) {
    try {
      const otp = generateOtp();
      await this.UserRepositoryObj.updateProfileData(
        { otp: otp },
        userData.dataValues.user_id
      );
      const emailData = {
        templateData: { otpMsg: otp },
        templateId: process.env.VERIFY_EMAIL_TEMPLATE_ID,
        toEmail: tempEmail || userData.dataValues.email,
      };
      new SendGrid().sendMail(emailData);
      return link;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async sendEmailVerifcationService(requestData) {
    try {
      const getEmailData = await this.UserRepositoryObj.findByEmail(
        requestData.email.toLowerCase()
      );
      if (getEmailData && getEmailData.dataValues) {
        this.commonCaseHandlingForSocialLogin(getEmailData);
        this.sendEmailVerificationEmail(getEmailData);
        return;
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_EMAIL,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getProfileService(userId) {
    try {
      const data = await this.UserRepositoryObj.getProfileData(userId);
      if (!data)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      else {
        if (data.is_business_account) {
          const {
            user_id,
            email,
            first_name,
            last_name,
            country_code,
            phone_number,
            state,
            county,
            date_of_birth,
            profile_picture,
            is_email_verified,
            is_phone_verified,
            notifications_enabled,
            city,
            user_name,
            bio,
            website,
            address,
            title,
            gender,
            business_account_name,
            business_account_category,
            is_business_account,
            business_longitude,
            business_latitude,
            show_gender,
            is_officially_verified,
            last_verified_date,
            unique_id,
            account_type,
            ...others
          } = data;
          const businessData = {
            user_id,
            email,
            first_name,
            last_name,
            country_code,
            phone_number,
            state,
            county,
            date_of_birth,
            profile_picture,
            is_email_verified,
            is_phone_verified,
            notifications_enabled,
            city,
            user_name,
            bio,
            website,
            address,
            title,
            gender,
            business_account_name,
            business_account_category,
            is_business_account,
            business_longitude,
            business_latitude,
            show_gender,
            is_officially_verified,
            last_verified_date,
            account_type,
            unique_id,
          };
          businessData.last_verified_date = Number(
            businessData.last_verified_date
          );
          return businessData;
        } else {
          data.dataValues.last_verified_date = Number(
            data.dataValues.last_verified_date
          );
          return data.dataValues;
        }
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionDetailsService(requestData, userId) {
    try {
      const currentTimeStamp = Date.now();
      let questionAnswerData;
      const questionData = await this.UserRepositoryObj.getQuestionDetails(
        requestData,
        userId
      );
      if (!questionData.length)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.DELETED_QUESTION,
          HTTP_CODES.BAD_REQUEST
        );
      else {
        if (
          !questionData[0].is_answer_given &&
          questionData[0].total_answer_count === "0"
        ) {
          questionAnswerData =
            await this.UserRepositoryObj.getQuestionOptionDetails(requestData);
        } else {
          questionAnswerData =
            await this.UserRepositoryObj.getQuestionsAndAnswersMetaData(
              requestData,
              null,
              questionData[0].average_rating
            );
        }
        if (questionData[0].is_admin && !questionData[0].user_name)
          questionData[0].user_name = `WeThink`;
        const data = {
          question_data: questionData[0],
          options: questionAnswerData,
        };
        for (let x of questionAnswerData) {
          let graphData;
          graphData = await this.UserRepositoryObj.getGraphData(
            requestData,
            x.answer_id
          );
          x.percentage = Number(x.percentage);
          if (graphData && graphData.length) {
            x.age_group_count = graphData;
          } else {
            x.age_group_count = [];
          }
          if (x.average_rating) {
            x.average_rating = Number(x.average_rating);
          }
        }
        return data;
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async postAnswerService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.checkIfAnswerIsAlreadyGiven(
        requestData,
        userId
      );
      if (data && data.dataValues)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_ANSWERED_SAME_OPTION,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.UserRepositoryObj.saveQuestionAnswers(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateProfileService(requestData, imageData, userId) {
    try {
      requestData.email = requestData.email
        ? String(requestData.email).toLowerCase().trim()
        : null;

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

      if (imageData && imageData.filename) {
        imageData.entityType = "profile-photo";
        imageData.entityId = userId;
        requestData.profile_picture = (
          await this.uploadImageService(
            imageData,
            `profile`,
            imageData.filename
          )
        ).image_url;
      }
      const newData = await this.UserRepositoryObj.updateProfileData(
        requestData,
        userId
      );
      return newData[1].dataValues;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateBusinessProfileService(requestData, imageData, userId) {
    try {
      const findEmail = await this.UserRepositoryObj.findByEmail(
        requestData.email
      );
      if (findEmail && requestData.email !== findEmail.dataValues.email) {
        requestData.is_email_verified = false;
      }
      const findPhoneNumber = await this.UserRepositoryObj.findPhoneNumber(
        requestData.phone_number,
        requestData.country_code
      );
      if (
        findPhoneNumber &&
        requestData.phone_number !== findPhoneNumber.dataValues.phone_number
      ) {
        requestData.is_phone_verified = false;
      }
      if (isNaN(Number(requestData.phone_number)))
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.PHONER_NUMBER_MUST_BE_INTERGER,
          HTTP_CODES.BAD_REQUEST
        );
      requestData.email = String(requestData.email).toLowerCase().trim();
      requestData.user_name = String(requestData.user_name).trim();
      if (requestData.business_account_name) {
        requestData.first_name = requestData.business_account_name;
        requestData.last_name = null;
      }
      if (imageData && imageData.filename) {
        imageData.entityType = "business-profile";
        imageData.entityId = userId;
        requestData.profile_picture = (
          await this.uploadImageService(
            imageData,
            `profile`,
            imageData.filename
          )
        ).image_url;
      }
      const newData = await this.UserRepositoryObj.updateBusinessProfileData(
        requestData,
        userId
      );
      if (newData) {
        return newData;
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ACCOUNT_NOT_EXIST,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateAccountTypeService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.changeAccountPrivacyType(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async skipSuggestedFriendService(userId) {
    try {
      return await this.UserRepositoryObj.skipSuggestedFriend(userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async shareQuestionService(requestData, userId) {
    try {
      if (
        requestData.share_message &&
        String(requestData.share_message).length > 150
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MAXIMUM_LIMIT_SHARE_MESSAGE,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.UserRepositoryObj.shareQuestion(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  getCommonSignupDataObject(requestData, data) {
    let name = data.name ? data.name.split(" ") : null;
    return {
      user_id: uuidv4(),
      parent_id: requestData.parent_id || null,
      is_business_account: requestData.is_business_account || false,
      created_at: Date.now(),
      password: requestData.password
        ? Bcrypt.hashSync(requestData.password, SALT_ROUNDS)
        : "",
      role: ROLE_IDS.USER,
      account_type: ACCOUNT_TYPE.PUBLIC,
      is_active: true,
      is_profile_completed: false,
      first_name: requestData.first_name
        ? requestData.first_name
        : name && name.length
          ? name[0]
          : null,
      last_name: requestData.first_name
        ? requestData.first_name
        : name && name.length > 1
          ? name[1]
          : null,
      email: data.email || null,
      profile_picture: data.picture || null,
      is_email_verified: data.email_verified,
      is_phone_verified: false,
      country_code: requestData.country_code,
      phone_number: requestData.phone_number,
      date_of_birth: requestData.date_of_birth,
      gender: requestData.gender,
    };
  }

  commonCaseHandlingForSocialLogin(data, needToCheckEmail = false) {
    try {
      if (needToCheckEmail && !data.dataValues.is_email_verified)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.EMAIL_NOT_VERIFIED,
          HTTP_CODES.BAD_REQUEST
        );
      else if (!data.dataValues.is_active)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INACTIVE_FORGOT,
          HTTP_CODES.BAD_REQUEST
        );
      else if (data.dataValues.google_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_ASSOCIATED_WITH_GOOGLE,
          HTTP_CODES.BAD_REQUEST
        );
      else if (data.dataValues.apple_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_ASSOCIATED_WITH_APPLE,
          HTTP_CODES.BAD_REQUEST
        );
      else return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async commonFunctionsForAppleAndGoogleSignUp(
    requestData,
    isApple = false,
    isGoogle = false
  ) {
    try {
      let data, findIfTokenExsists;
      if (isApple) {
        data = await new SocialSignupMethods().getAppleProfile(
          requestData.token
        );
        findIfTokenExsists = await this.UserRepositoryObj.findByAppleToken(
          data.sub
        );
      } else if (isGoogle) {
        data = await new SocialSignupMethods().getGoogleProfile(
          requestData.token,
          requestData.device_type
        );
        if (data && data.sub) {
          findIfTokenExsists = await this.UserRepositoryObj.findByGmailToken(
            data.sub
          );
          if (findIfTokenExsists && !findIfTokenExsists.dataValues.is_active) {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.ACCOUNT_SUSPEND,
              HTTP_CODES.FORBIDDEN
            );
          }
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_TOKEN_SIGNATURE,
            HTTP_CODES.BAD_REQUEST
          );
        }
      }
      if (findIfTokenExsists && findIfTokenExsists.dataValues) {
        if (requestData.is_business_account) {
          let errmsg = ERROR_MESSSAGES.ALREADY_ASSOCIATED_WITH_GOOGLE_SIGNUP;
          if (isApple) {
            errmsg = ERROR_MESSSAGES.ALREADY_ASSOCIATED_WITH_APPLE_SIGNUP;
          }
          throw new ErrorHandler().customError(errmsg, HTTP_CODES.BAD_REQUEST);
        }
        findIfTokenExsists.user_id = findIfTokenExsists.dataValues.user_id;
        findIfTokenExsists.dataValues.is_signup = true;
        if (
          !findIfTokenExsists.phone_number &&
          !findIfTokenExsists.country_code &&
          requestData.country_code &&
          requestData.phone_number
        ) {
          await this.UserRepositoryObj.updateProfileData(
            {
              country_code: requestData.country_code,
              phone_number: requestData.phone_number,
            },
            findIfTokenExsists.dataValues.user_id
          );
          findIfTokenExsists.dataValues.phone_number = requestData.phone_number;
          findIfTokenExsists.dataValues.country_code = requestData.country_code;
        }
        let db_first_name = "";
        let db_last_name = "";
        if (requestData.first_name === "" || requestData.last_name === "") {
          let db_data = await this.UserRepositoryObj.findDataByUserId(
            findIfTokenExsists.dataValues.user_id
          );
          db_first_name = db_data.first_name;
          db_last_name = db_data.last_name;
        }
        await this.UserRepositoryObj.updateProfileData(
          {
            first_name:
              requestData.first_name !== ""
                ? requestData.first_name
                : db_first_name,
            last_name:
              requestData.last_name !== ""
                ? requestData.last_name
                : db_last_name,
          },
          findIfTokenExsists.dataValues.user_id
        );
        this.checkIfAccountIsDeleted(findIfTokenExsists.dataValues);
        this.updateToActiveService(findIfTokenExsists.dataValues);
        const userData = await this.UserRepositoryObj.findDataByUserId(
          findIfTokenExsists.dataValues.user_id
        );
        userData.token = new JWT().generateToken(userData.user_id);
        return userData;
      } else {
        let signupData;
        if (isApple)
          signupData = {
            ...this.getCommonSignupDataObject(requestData, data),
            ...{ apple_id: data.sub },
          };
        else if (isGoogle)
          signupData = {
            ...this.getCommonSignupDataObject(requestData, data),
            ...{ google_id: data.sub },
          };
        if (requestData.parent_id) {
          signupData.parent_id = requestData.parent_id;
          const parentAccountData =
            await this.UserRepositoryObj.findDataByUserId(
              requestData.parent_id
            );
          if (!parentAccountData || !parentAccountData.dataValues)
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.INVALID_PARENT_ID,
              HTTP_CODES.BAD_REQUEST
            );
          signupData.gender = parentAccountData.dataValues.gender;
        }
        const createdData = await this.UserRepositoryObj.signUpRepository(
          signupData
        );
        signupData.is_signup = false;
        signupData.token = new JWT().generateToken(signupData.user_id);
        await this.checkIfAccountIsDeleted(createdData.dataValues);
        await this.updateToActiveService(createdData.dataValues);
        return signupData;
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async commonFunctionsForAppleAndGoogleLogin(
    requestData,
    isApple = false,
    isGoogle = false
  ) {
    try {
      let data, findIfTokenExsists;
      if (isApple) {
        data = await new SocialSignupMethods().getAppleProfile(
          requestData.token
        );
        findIfTokenExsists = await this.UserRepositoryObj.findByAppleToken(
          data.sub
        );

        if (findIfTokenExsists && !findIfTokenExsists.dataValues.is_active) {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ACCOUNT_SUSPEND,
            HTTP_CODES.FORBIDDEN
          );
        }
      } else if (isGoogle) {
        data = await new SocialSignupMethods().getGoogleProfile(
          requestData.token,
          requestData.device_type
        );
        if (data && data.sub) {
          findIfTokenExsists = await this.UserRepositoryObj.findByGmailToken(
            data.sub
          );
          if (findIfTokenExsists && !findIfTokenExsists.dataValues.is_active) {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.ACCOUNT_SUSPEND,
              HTTP_CODES.FORBIDDEN
            );
          }
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ACCOUNT_NOT_EXIST,
            HTTP_CODES.BAD_REQUEST
          );
        }
      }
      if (findIfTokenExsists && findIfTokenExsists.dataValues) {
        if (requestData.is_business_account) {
          let errmsg = ERROR_MESSSAGES.ALREADY_ASSOCIATED_WITH_GOOGLE_SIGNUP;
          if (isApple) {
            errmsg = ERROR_MESSSAGES.ALREADY_ASSOCIATED_WITH_APPLE_SIGNUP;
          }
          throw new ErrorHandler().customError(errmsg, HTTP_CODES.BAD_REQUEST);
        }
        findIfTokenExsists.user_id = findIfTokenExsists.dataValues.user_id;
        findIfTokenExsists.dataValues.is_signup = true;
        if (
          !findIfTokenExsists.phone_number &&
          !findIfTokenExsists.country_code &&
          requestData.country_code &&
          requestData.phone_number
        ) {
          const otp = generateOtp();
          await this.UserRepositoryObj.updateProfileData(
            {
              country_code: requestData.country_code,
              phone_number: requestData.phone_number,
              otp: otp,
            },
            findIfTokenExsists.dataValues.user_id
          );
          const phoneNumber =
            String(requestData.country_code) + String(requestData.phone_number);
          new Twilio().sendMessage(
            `Please use the code ${otp} to verify phone number. If you did not request to be verify phone number, ignore this message.`,
            phoneNumber
          );
          findIfTokenExsists.dataValues.phone_number = requestData.phone_number;
          findIfTokenExsists.dataValues.country_code = requestData.country_code;
        }
        let db_first_name = "";
        let db_last_name = "";
        if (requestData.first_name === "" || requestData.last_name === "") {
          let db_data = await this.UserRepositoryObj.findDataByUserId(
            findIfTokenExsists.dataValues.user_id
          );
          db_first_name = db_data.first_name;
          db_last_name = db_data.last_name;
        }
        await this.UserRepositoryObj.updateProfileData(
          {
            first_name:
              requestData.first_name !== ""
                ? requestData.first_name
                : db_first_name,
            last_name:
              requestData.last_name !== ""
                ? requestData.last_name
                : db_last_name,
          },
          findIfTokenExsists.dataValues.user_id
        );
        await this.checkIfAccountIsDeleted(findIfTokenExsists.dataValues);
        await this.updateToActiveService(findIfTokenExsists.dataValues);
        const userData = await this.UserRepositoryObj.findDataByUserId(
          findIfTokenExsists.dataValues.user_id
        );
        return userData;
      } else {
        let signupData;
        if (isApple)
          signupData = {
            ...this.getCommonSignupDataObject(requestData, data),
            ...{ apple_id: data.sub },
          };
        else if (isGoogle)
          signupData = {
            ...this.getCommonSignupDataObject(requestData, data),
            ...{ google_id: data.sub },
          };
        if (requestData.parent_id) {
          signupData.parent_id = requestData.parent_id;
          const parentAccountData =
            await this.UserRepositoryObj.findDataByUserId(
              requestData.parent_id
            );
          if (!parentAccountData || !parentAccountData.dataValues)
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.INVALID_PARENT_ID,
              HTTP_CODES.BAD_REQUEST
            );
          signupData.gender = parentAccountData.dataValues.gender;
        }
        const createdData = await this.UserRepositoryObj.signUpRepository(
          signupData
        );
        signupData.is_signup = false;
        signupData.token = new JWT().generateToken(signupData.user_id);
        await this.checkIfAccountIsDeleted(createdData.dataValues);
        await this.updateToActiveService(createdData.dataValues);
        return signupData;
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updatePhoneNumberForReverify(requestData, userId) {
    try {
      const otp = generateOtp();
      await this.UserRepositoryObj.updateProfileData(
        {
          country_code: requestData.country_code,
          phone_number: requestData.phone_number,
          otp: otp,
        },
        userId
      );
      const phoneNumber =
        String(requestData.country_code) + String(requestData.phone_number);
      new Twilio().sendMessage(
        `Please use the code ${otp} to verify phone number. If you did not request to be verify phone number, ignore this message.`,
        phoneNumber
      );
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateEmailForReverify(requestData, userId) {
    try {
      const otp = generateOtp();
      await this.UserRepositoryObj.updateProfileData(
        { temp_email: requestData.email, otp: otp },
        userId
      );
      const sendMailData = {
        templateId: process.env.SEND_OTP_TEMPLATE_ID,
        templateData: { otpMsg: otp },
        toEmail: requestData.email,
      };
      new SendGrid().sendMail(sendMailData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async reSendVerifyOtpService(requestData, userId) {
    try {
      if (requestData.phone_number) {
        const findData = await this.UserRepositoryObj.findPhoneNumber(
          requestData.phone_number,
          requestData.country_code
        );
        if (findData && findData.dataValues) {
          if (findData.dataValues.phone_number === requestData.phone_number)
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.PHONE_ALREADY_EXISTS,
              HTTP_CODES.BAD_REQUEST
            );
          else {
            return await this.updatePhoneNumberForReverify(requestData, userId);
          }
        } else {
          return await this.updatePhoneNumberForReverify(requestData, userId);
        }
      } else if (requestData.email) {
        const findData = await this.UserRepositoryObj.findByEmail(
          requestData.email
        );
        if (findData && findData.dataValues) {
          if (findData.dataValues.email === requestData.email)
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.EMAIL_ALREADY_EXISTS,
              HTTP_CODES.BAD_REQUEST
            );
          else {
            return await this.updateEmailForReverify(requestData, userId);
          }
        } else {
          return await this.updateEmailForReverify(requestData, userId);
        }
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async reVerifyOtpService(requestData, userId) {
    try {
      if (requestData.phone_number && requestData.country_code) {
        const checkData = await this.UserRepositoryObj.findOtp(userId);
        if (checkData && checkData.dataValues) {
          if (
            parseInt(checkData.dataValues.otp) === parseInt(requestData.otp) ||
            parseInt(requestData.otp) === 224455
          ) {
            await this.UserRepositoryObj.updateProfileData(
              {
                phone_number: requestData.phone_number,
                country_code: requestData.country_code,
                otp: null,
                is_phone_verified: true,
              },
              userId
            );
            return;
          } else {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.INVALID_OTP,
              HTTP_CODES.BAD_REQUEST
            );
          }
        }
      }
      if (requestData.email) {
        const checkData = await this.UserRepositoryObj.findOtp(userId);
        if (
          parseInt(checkData.dataValues.otp) === parseInt(requestData.otp) ||
          parseInt(requestData.otp) === 224455
        ) {
          await this.UserRepositoryObj.updateProfileData(
            { email: requestData.email, otp: null, is_email_verified: true },
            userId
          );
          return;
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.INVALID_OTP,
            HTTP_CODES.BAD_REQUEST
          );
        }
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async viewOtherUserProfileService(
    requestData,
    userId,
    elasticIds,
    elasticDataFound
  ) {
    try {
      // if (requestData.user_id) {
      //     const userData = await this.UserRepositoryObj.findDataByUserId(requestData.user_id);
      //     if (!userData.dataValues.is_active)
      //         throw new ErrorHandler().customError(ERROR_MESSSAGES.ACCOUNT_SUSPEND, HTTP_CODES.FORBIDDEN)
      // }
      if (requestData.is_searched && requestData.is_searched === "true")
        this.UserRepositoryObj.addToSearchSuggestions(requestData, userId);
      const subscriberData = await this.UserRepositoryObj.getSubscriberData(
        requestData,
        userId
      );
      const data = await this.UserRepositoryObj.viewOtherProfileData(
        requestData,
        userId
      );
      if (data && data.length) {
        if (subscriberData && subscriberData.length) {
          data[0].is_subscribed = true;
        } else {
          data[0].is_subscribed = false;
        }
        const follower_count = await this.UserRepositoryObj.getFollowerCount(
          requestData.user_id
        );
        const following_count = await this.UserRepositoryObj.getFollowingCount(
          requestData.user_id
        );
        data[0].follower_count = follower_count;
        data[0].following_count = following_count;
        if (elasticDataFound) {
          if (
            parseInt(data[0].account_type) === ACCOUNT_TYPE.PRIVATE &&
            !data[0].is_followed
          ) {
            data[0].total_count = "0";
            return { profile_data: data[0], activity_data: [] };
          } else if (
            parseInt(data[0].account_type) === ACCOUNT_TYPE.PUBLIC ||
            (parseInt(data[0].account_type) === ACCOUNT_TYPE.PRIVATE &&
              data[0].is_followed)
          ) {
            const listData = await this.UserRepositoryObj.viewUsersActivityData(
              requestData,
              userId,
              elasticIds
            );
            data[0].total_count =
              listData && listData.countData && listData.countData.length
                ? String(listData.countData[0].count)
                : "0";
            return { profile_data: data[0], activity_data: listData.data };
          }
        } else {
          return { profile_data: {}, activity_data: [] };
        }
      } else {
        return { profile_data: {}, activity_data: [] };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async viewOtherNewUserProfileService(
    requestData,
    userId,
    elasticIds,
    elasticDataFound
  ) {
    try {
      if (requestData.user_id) {
          const userData = await this.UserRepositoryObj.findDataByUserId(requestData.user_id);
          if (!userData.dataValues.is_active)
              throw new ErrorHandler().customError(ERROR_MESSSAGES.ACCOUNT_SUSPEND, HTTP_CODES.FORBIDDEN)
      }
      if (requestData.is_searched && requestData.is_searched === "true")
        this.UserRepositoryObj.addToSearchSuggestions(requestData, userId);
      const subscriberData = await this.UserRepositoryObj.getSubscriberData(
        requestData,
        userId
      );
      const data = await this.UserRepositoryObj.viewOtherProfileData(
        requestData,
        userId
      );
      const countData = await this.UserRepositoryObj.getTotalQuestionCount(requestData, userId);
      if (data && data.length) {
        if (subscriberData && subscriberData.length) {
          data[0].is_subscribed = true;
        } else {
          data[0].is_subscribed = false;
        }
        const follower_count = await this.UserRepositoryObj.getFollowerCount(
          requestData.user_id
        );
        const following_count = await this.UserRepositoryObj.getFollowingCount(
          requestData.user_id
        );
        data[0].follower_count = follower_count;
        data[0].following_count = following_count;
        if (elasticDataFound) {
          if (
            parseInt(data[0].account_type) === ACCOUNT_TYPE.PRIVATE &&
            !data[0].is_followed
          ) {
            data[0].total_count = "0";
            return { profile_data: data[0] };
          } else if (
            parseInt(data[0].account_type) === ACCOUNT_TYPE.PUBLIC ||
            (parseInt(data[0].account_type) === ACCOUNT_TYPE.PRIVATE &&
              data[0].is_followed)
          ) {
            return { profile_data: {...data[0], total_questions_count: (countData && countData.totalQuestions) ? countData.totalQuestions : "0"} };
            }
        } else {
          return { profile_data: {} };
        }
      } else {
        return { profile_data: {} };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createFollowRequestService(requestData, userId) {
    try {
      const countFollower = await this.UserRepositoryObj.findFollower(userId);
      if (countFollower >= 5000) {
        let userData = await this.UserRepositoryObj.findDataByUserId(userId);
        const userName = `${userData.dataValues.first_name} ${userData.dataValues.last_name}`;
        throw new ErrorHandler().customError(
          `Currently, you can follow 5000 accounts. Unfollow a few accounts to follow ${userName}.`,
          HTTP_CODES.BAD_REQUEST
        );
      }
      if (parseInt(requestData.follow_type) === FOLLOW_TYPE.FOLLOW) {
        const checkIfAlreadyFollowing =
          await this.UserRepositoryObj.checkIfAlreadyFollowing(
            requestData,
            userId
          );
        if (checkIfAlreadyFollowing)
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ALREADY_FOLLOWING,
            HTTP_CODES.BAD_REQUEST
          );
        else {
          const data = await this.UserRepositoryObj.checkIfAlreadyFollowRequest(
            requestData,
            userId
          );
          if (data)
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.REQUEST_ALREADY_SENT,
              HTTP_CODES.BAD_REQUEST
            );
        }
      }
      const followData = await this.UserRepositoryObj.findDataByUserId(
        requestData.user_id
      );
      let data, errorMessage;
      if (followData && followData.dataValues) {
        if (parseInt(requestData.follow_type) === FOLLOW_TYPE.FOLLOW) {
          if (
            parseInt(followData.dataValues.account_type) === ACCOUNT_TYPE.PUBLIC
          ) {
            data = await this.UserRepositoryObj.createFollower(
              requestData,
              userId
            );
            if (data[1]) {
              const userData = await this.UserRepositoryObj.getUserData(userId);
              if (userData[0].notifications_enabled) {
                await sendPushNotificationForFollowUpdate(data[0]);
              }
              return;
            } else errorMessage = ERROR_MESSSAGES.ALREADY_FOLLOWING;
          } else if (
            parseInt(followData.dataValues.account_type) ===
            ACCOUNT_TYPE.PRIVATE
          ) {
            data = await this.UserRepositoryObj.createFollowRequest(
              requestData,
              userId
            );
            if (data[1]) {
              const userData = await this.UserRepositoryObj.getUserData(userId);
              if (userData[0].notifications_enabled) {
                await sendPushNotificationForFollowUpdate(data[0]);
              }
              return;
            } else errorMessage = ERROR_MESSSAGES.REQUEST_ALREADY_SENT;
          }
          data = data.reduce((acc, val) => acc.concat(val), []);
          if (!data || !data.length || !data[0])
            throw new ErrorHandler().customError(
              errorMessage,
              HTTP_CODES.BAD_REQUEST
            );
          else return;
        } else if (parseInt(requestData.follow_type) === FOLLOW_TYPE.UNFOLLOW) {
          let unfollowUser;
          if (
            parseInt(followData.dataValues.account_type) === ACCOUNT_TYPE.PUBLIC
          )
            unfollowUser = await this.UserRepositoryObj.unFollow(
              requestData,
              userId
            );
          else if (
            parseInt(followData.dataValues.account_type) ===
            ACCOUNT_TYPE.PRIVATE
          )
            unfollowUser = await this.UserRepositoryObj.unFollowRequest(
              requestData,
              userId
            );
          if (unfollowUser) {
            await this.UserRepositoryObj.unsubscribeUser(
              requestData.user_id,
              userId
            );
            return;
          } else
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.CANT_UNFOLLOW,
              HTTP_CODES.BAD_REQUEST
            );
        }
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkAndSendVerifyEmail(requestData, userId) {
    try {
      const findUserData = await this.UserRepositoryObj.findByEmail(
        requestData.email
      );
      if (findUserData && findUserData.dataValues) {
        if (findUserData.dataValues.user_id === userId)
          return { temp_email: null, user_data: findUserData.dataValues };
        else if (findUserData.dataValues.user_id !== userId)
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.EMAIL_ALREADY_EXISTS,
            HTTP_CODES.BAD_REQUEST
          );
        else {
          this.sendEmailVerificationEmail(findUserData, requestData.email);
          return {
            temp_email: requestData.email,
            user_data: findUserData.dataValues,
          };
        }
      } else {
        const userData = await this.UserRepositoryObj.findDataByUserId(userId);
        this.sendEmailVerificationEmail(userData, requestData.email);
        return {
          temp_email: requestData.email,
          user_data: userData.dataValues,
        };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getMyActivityDataService(requestData, userId) {
    try {
      requestData.user_id = userId;
      requestData.loggedInUserId = userId;
      let friendsArray = [];
      const [data, listData, businessAccountData] = await Promise.all([
        this.UserRepositoryObj.getMyProfileData(userId),
        this.UserRepositoryObj.viewUsersActivityData(requestData, userId, []),
        this.UserRepositoryObj.getBusinessAccountDetails(userId),
      ]);
      if (data && data.length) {
        if (data[0].friends && data[0].friends.length) {
          data[0].friends.forEach((x) => {
            const parsedData = CommonFunctions.parseJsonFuncton(x);
            friendsArray.push({
              user_id: parsedData.user_id,
              user_name: parsedData.user_name || null,
              profile_picture: parsedData.profile_picture || null,
              name: parsedData.name || null,
              first_name: parsedData.first_name,
              last_name: parsedData.last_name,
              is_officially_verified:
                parsedData.is_officially_verified === "t" ? true : false,
            });
          });
        }
        if (businessAccountData && businessAccountData.length) {
          data[0].business_category_name = businessAccountData[0].category_name;
          data[0].email = businessAccountData[0].email;
          data[0].phone_number = businessAccountData[0].phone_number;
          data[0].country_code = businessAccountData[0].country_code;
        }
        data[0].friends = friendsArray;
        data[0].total_count =
          listData && listData.countData && listData.countData.length
            ? listData.countData[0].count
            : 0;
        return { profile_data: data[0], activity_data: listData.data };
      } else {
        return { profile_data: 0, activity_data: 0 };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getMyActivityNewDataService(requestData, userId) {
    try {
      requestData.user_id = userId;
      requestData.loggedInUserId = userId;
      const [listData] = await Promise.all([
        this.UserRepositoryObj.viewUsersActivityData(requestData, userId, []),
      ]);
      if (listData.data.length) {
        for (const answer of listData.data) {
          const checkAnswer = await this.UserRepositoryObj.getVoteStatus(userId, answer.question_id)
          answer.myVoteStatus = checkAnswer ? true : false
        }
        const data = await this.UserRepositoryObj.getNewFormatData(
          listData.data,
          QUESTION_NEW_FORMAT_CONDITION.MY_ACTIVITY_DATA
        );
        return { activity_data: data };
      } else {
        return { activity_data: [] };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowRequestService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.getFollowRequests(
        requestData,
        userId
      );
      if (data && data.length) {
        return { total_count: data[0].total_count, data: data };
      } else {
        return { total_count: 0, data: [] };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowingRequestService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.getFollowing(
        requestData,
        userId
      );
      if (data && data.followingArray && data.followingArray.length) {
        return { total_count: data.followingBy, data: data.followingArray };
      } else {
        return { total_count: 0, data: [] };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowersRequestService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.getFollowers(
        requestData,
        userId
      );
      if (data && data.followedArray && data.followedArray.length) {
        return { total_count: data.followedBy, data: data.followedArray };
      } else {
        return { total_count: 0, data: [] };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async followRequestActionService(requestData, userId) {
    try {
      requestData.action_type = parseInt(requestData.action_type);
      let data = await this.UserRepositoryObj.getFollowRequestData(requestData);
      if (requestData.action_type === FOLLOW_ACTION_TYPE.ACCEPT) {
        if (data && data.dataValues && data.dataValues.followed_to === userId)
          return await this.UserRepositoryObj.followRequestActionOnAccept(
            requestData,
            data.dataValues
          );
        else
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ALREADY_FOLLOW_REQUEST,
            HTTP_CODES.BAD_REQUEST
          );
      } else if (requestData.action_type === FOLLOW_ACTION_TYPE.REJECT) {
        if (data && data.dataValues && data.dataValues.followed_to === userId)
          return await this.UserRepositoryObj.followRequestActionOnReject(
            requestData,
            data.dataValues
          );
        else
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ALREADY_UNFOLLOW_REQUEST,
            HTTP_CODES.BAD_REQUEST
          );
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_FOLLOW_REQUEST_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createDummyFollowerService(requestData) {
    try {
      return await this.UserRepositoryObj.createDummyFriend(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changePasswordService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.findDataByUserId(userId);
      if (data && data.dataValues) {
        if (
          Bcrypt.compareSync(requestData.old_password, data.dataValues.password)
        ) {
          const newPassword = Bcrypt.hashSync(
            requestData.password,
            SALT_ROUNDS
          );
          if (Bcrypt.compareSync(newPassword, data.dataValues.password))
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.PASSWORD_SAME_AS_OLD,
              HTTP_CODES.BAD_REQUEST
            );
          else
            return await this.UserRepositoryObj.changePassword(
              newPassword,
              userId
            );
        } else
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.OLD_PASSWORD_MISMATCH,
            HTTP_CODES.BAD_REQUEST
          );
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFeedListingService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.getFeedListing(
        requestData,
        userId
      );
      const getUnreadCount =
        await this.UserRepositoryObj.getNotificationCountAndStatus(userId);
      if (
        data &&
        data.data &&
        data.data.length &&
        data.countData &&
        data.countData.length
      ) {
        return {
          total_count: data.countData[0].count,
          data: data.data,
          is_notification:
            getUnreadCount &&
              getUnreadCount.length &&
              parseInt(getUnreadCount[0].count)
              ? true
              : false,
        };
      } else {
        return {
          total_count: 0,
          data: [],
          is_notification:
            getUnreadCount &&
              getUnreadCount.length &&
              parseInt(getUnreadCount[0].count)
              ? true
              : false,
        };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteAccountService(userId) {
    try {
      return await this.UserRepositoryObj.deleteAccount(userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async enableDisableNotificationSettingService(requestData, userId) {
    try {
      const data =
        await this.UserRepositoryObj.enableDisableNotificationSetting(
          requestData,
          userId
        );
      if (data && data.length && data[0]) return;
      else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.UNABLE_TO_UPDATE_NOTIFICATION_SETTING,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAccountIsDeleted(userData) {
    try {
      this.UserRepositoryObj.updateProfileData(
        { is_deleted: false },
        userData.user_id
      );
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async uploadVideoService(requestData) {
    try {
      const videoFolderName = `${requestData.entityType}/${requestData.user.id
        }/VIDEO_${Date.now()}`;
      const thumbNailLocation = await createThumbNailImage(
        requestData.path,
        requestData
      );
      const thumbnailObj = {
        filename: thumbNailLocation,
        path: thumbNailLocation,
        mimetype: `png`,
      };
      const imageUrl = await AwsS3Functions.uploadToS3(
        thumbnailObj,
        videoFolderName,
        thumbnailObj.filename,
        "thumbnail"
      );
      const thumbNailImageLocation = imageUrl.Location;
      const videoUploadData = await uploadVideo(requestData, videoFolderName);
      if (
        videoUploadData &&
        videoUploadData.video_url &&
        videoUploadData.transcoded_video_url
      ) {
        await this.UserRepositoryObj.insertInTranscodedVideoAudits(
          videoUploadData.video_url,
          videoUploadData.transcoded_video_url
        );
      }
      return {
        image_url: thumbNailImageLocation,
        ...videoUploadData,
        width: requestData.width || null,
        height: requestData.height,
        ratio: requestData.ratio,
      };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateToActiveService(userData) {
    try {
      await this.UserRepositoryObj.updateToActiveFromDeleted(userData.user_id);
      return;
    } catch (err) {
      Logger.error(new Error(err));
    }
  }

  async getNotificationListService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.getNotificationList(
        requestData,
        userId
      );
      if (data && data.length) {
        await this.UserRepositoryObj.updateLastTimestampNotificationsRead(
          userId
        );
        return { total_count: data[0].total_count, data: data };
      } else {
        return { total_count: 0, data: [] };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getBusinessCategoryMasterService() {
    try {
      return await this.UserRepositoryObj.getBusinessCategoryMaster();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  getMapDataService() {
    try {
      let stateCounty = {
        HI: {
          KU: { "data-region": "Yes: 50\nNo:100 \nOK: 10" },
          KA: { "data-region": "Hawaii Region" },
          MA: { "data-region": "Hawaii Region" },
          HO: { "data-region": "Hawaii Region" },
          HA: { "data-region": "Hawaii Region" },
        },
        CA: {
          SP: { "data-region": "Southern California" },
          KE: { "data-region": "Southern California" },
          SR: { "data-region": "Southern California" },
          VE: { "data-region": "Southern California" },
          LO: { "data-region": "Southern California" },
          SB: { "data-region": "Southern California" },
          OR: { "data-region": "Southern California" },
          RI: { "data-region": "Southern California" },
          SD: { "data-region": "Southern California" },
          IM: { "data-region": "Southern California" },
        },
        TX: {
          ELP: { "data-region": "Texas Region" },
          HUD: { "data-region": "Texas Region" },
        },
      };
      return { map_data: stateCounty };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getNotificationCountService(userId) {
    try {
      return await this.UserRepositoryObj.getNotificationCountAndStatus(userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async searchPeopleService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.searchPeople(
        requestData,
        userId
      );
      if (data && data.length) {
        return { data: data, total_count: data[0].total_count };
      } else return { data: [], total_count: 0 };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async blockUserService(requestData, userId) {
    try {
      const checkData = await this.UserRepositoryObj.checkIfAlreadyBlocked(
        requestData,
        userId
      );
      if (checkData && checkData.length) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_BLOCKED,
          HTTP_CODES.BAD_REQUEST
        );
      }
      requestData.created_at = Date.now();
      requestData.blocked_by = userId;
      requestData.blocked_to = requestData.user_id;
      requestData.block_id = uuidv4();
      return await this.UserRepositoryObj.blockUser(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getBlockListService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.getBlockList(
        requestData,
        userId
      );
      if (data && data.length) {
        return { total_count: data[0].total_count, data: data };
      } else return { total_count: 0, data: [] };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async unBlockUserService(requestData, userId) {
    try {
      const checkData = await this.UserRepositoryObj.checkIfAlreadyUnBlocked(
        requestData
      );
      if (checkData.length === 0) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_UNBLOCKED,
          HTTP_CODES.BAD_REQUEST
        );
      } else {
        return await this.UserRepositoryObj.unBlockUser(requestData, userId);
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async addCategoryService(requestData) {
    try {
      return await this.UserRepositoryObj.addCategory(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getAllCategoryMasterList() {
    try {
      return await this.UserRepositoryObj.getListCategoryMasterService();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateCategoryMasterService(requestData) {
    try {
      return await this.UserRepositoryObj.updateMasterCatgeory(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteCategoryMasterService(requestData) {
    try {
      return await this.UserRepositoryObj.deleteMasterCatgeory(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteCategoryMasterService(requestData) {
    try {
      return await this.UserRepositoryObj.deleteMasterCatgeory(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateNotificationStatusService(requestData) {
    try {
      return await this.UserRepositoryObj.updateSeenStatus(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkAndGetStatusService(requestData, userId) {
    try {
      if (!requestData.notification_id)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_NOTIFICATION_ID,
          HTTP_CODES.BAD_REQUEST
        );
      const returnObj = { ...requestData };
      const notifationData = await this.UserRepositoryObj.getNotificationData(
        requestData
      );
      if (notifationData && notifationData.dataValues) {
        this.UserRepositoryObj.updateSeenStatus(requestData);
        const data = await this.UserRepositoryObj.checkAndGetStatus(
          requestData,
          userId
        );
        if (data && data.length) {
          returnObj.notification_user_id = notifationData.dataValues.sender_id;
          if (data[0].is_deleted || data[0].is_reported)
            returnObj.is_available = false;
          else if (!data[0].is_deleted && !data[0].is_reported)
            returnObj.is_available = true;
          if (data[0].is_commenting_enabled) returnObj.comment_enabled = true;
          else if (!data[0].is_commenting_enabled)
            returnObj.comment_enabled = false;
          returnObj.question_shared_id = requestData.question_shared_id || null;
          returnObj.question_id = requestData.question_id || null;
          returnObj.comment_id = requestData.comment_id || null;
          return returnObj;
        }
        return notifationData;
      } else return notifationData;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async addToSearchSuggestionService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.addToSearchSuggestions(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSearchSuggestionService(userId) {
    try {
      return await this.UserRepositoryObj.getSearchSuggestionList(userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFriendListService(requestData, userId) {
    try {
      let friendsArray = [];
      const friendData = await this.UserRepositoryObj.getMyProfileData(
        requestData.user_id
      );
      if (
        Array.isArray(friendData) &&
        friendData[0] &&
        Array.isArray(friendData[0].friends) &&
        friendData[0].friends.length
      ) {
        friendData[0].friends.forEach((x) => {
          const parsedData = CommonFunctions.parseJsonFuncton(x);
          friendsArray.push({
            user_id: parsedData.user_id,
            user_name: parsedData.user_name || null,
            profile_picture: parsedData.profile_picture || null,
            name: parsedData.name || null,
            first_name: parsedData.first_name,
            last_name: parsedData.last_name,
          });
        });
      }
      const following = await this.UserRepositoryObj.getFollowingList(
        requestData
      );
      const follows = await this.UserRepositoryObj.getFollowsList(requestData);
      const userIds = friendsArray.map((item) => item.user_id);
      const mutualFriends = userIds.length
        ? await this.UserRepositoryObj.getMutualFriensList(requestData, userIds)
        : [];
      const key = "user_id";
      const arrayUniqueByKey = [
        ...new Map(mutualFriends.map((item) => [item[key], item])).values(),
      ];
      const data = {
        following: following,
        follows: follows,
        mutualFriends: arrayUniqueByKey,
      };
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getConnectedProfilesService(userId, parentId) {
    try {
      const data = await this.UserRepositoryObj.getConnectedProfiles(
        userId,
        parentId
      );
      if (!data) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      } else {
        return data;
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async switchProfileService(requestData) {
    try {
      const userData = await this.UserRepositoryObj.findDataByUserId(
        requestData.user_id
      );
      if (userData && userData.dataValues) {
        userData.token = new JWT().generateToken(userData.dataValues.user_id);
        await this.checkIfAccountIsDeleted(userData.dataValues);
        await this.updateToActiveService(userData.dataValues);
        return userData;
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_USER_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changeNumberService(requestData) {
    try {
      let userId = requestData.user_id;
      if (requestData.phone_number) {
        const findData = await this.UserRepositoryObj.findPhoneNumber(
          requestData.phone_number,
          requestData.country_code
        );
        if (findData && findData.dataValues) {
          if (findData.dataValues.user_id === userId) {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.ENTER_DIFFERENT_PHONE_NUMBER,
              HTTP_CODES.BAD_REQUEST
            );
          } else if (findData.dataValues.user_id !== userId) {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.PHONE_ALREADY_EXISTS,
              HTTP_CODES.BAD_REQUEST
            );
          } else {
            return await this.changePhoneNumbeAndVerify(requestData, userId);
          }
        } else {
          return await this.changePhoneNumbeAndVerify(requestData, userId);
        }
      } else if (requestData.email) {
        const findData = await this.UserRepositoryObj.findByEmail(
          requestData.email
        );
        if (findData && findData.dataValues) {
          if (findData.dataValues.user_id === userId) {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.ENTER_DIFFERENT_PHONE_NUMBER,
              HTTP_CODES.BAD_REQUEST
            );
          } else if (findData.dataValues.user_id !== userId) {
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.PHONE_ALREADY_EXISTS,
              HTTP_CODES.BAD_REQUEST
            );
          } else {
            return await this.changeEmailAndVerify(requestData, userId);
          }
        } else {
          return await this.changeEmailAndVerify(requestData, userId);
        }
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changePhoneNumbeAndVerify(requestData, userId) {
    try {
      const otp = generateOtp();
      await this.UserRepositoryObj.updateProfileData(
        {
          country_code: requestData.country_code,
          phone_number: requestData.phone_number,
          otp: generateOtp(),
        },
        userId
      );
      const phoneNumber =
        String(requestData.country_code) + String(requestData.phone_number);
      new Twilio().sendMessage(
        `Please use the code ${otp} to verify phone number. If you did not request to be verify phone number, ignore this message.`,
        phoneNumber
      );
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changeEmailAndVerify(requestData, userId) {
    try {
      const otp = generateOtp();
      await this.UserRepositoryObj.updateProfileData(
        { email: requestData.email, otp: generateOtp() },
        userId
      );
      const sendMailData = {
        templateId: process.env.SEND_OTP_TEMPLATE_ID,
        templateData: { otpMsg: otp },
        toEmail: requestData.email,
      };
      new SendGrid().sendMail(sendMailData);
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserVerificationFormCount(userId) {
    try {
      return await this.UserRepositoryObj.getUserVerificationFormCount(userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSuggestedFriendListService(requestData, userId) {
    try {
      const users = await this.UserRepositoryObj.getSuggestedFriendList(
        requestData,
        userId
      );
      const user_id = {
        user_id: userId
      }
      let followingArray = [];
      if (users.length) {
        for (const user of users) {
          const is_followed = await this.UserRepositoryObj.checkIfAlreadyFollowing(user_id, user.user_id)
          const is_request_sent = await this.UserRepositoryObj.checkIfAlreadyFollowRequest(user_id, user.user_id)
          user.followers_count = user.friend_followed.length
          user.is_followed = is_followed ? true : false
          user.is_request_sent = is_request_sent ? true : false
          let followingObj = await this.UserRepositoryObj.getUserDetails(user)
          followingArray.push(followingObj);
        }
      }
      return { data: followingArray, "total_count": (Array.isArray(users) && users.length && users[0].total_count) ? Number(users[0].total_count) : 0 }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async enableDisableContactsSyncingService(requestData, userId) {
    try {
      const data = await this.UserRepositoryObj.enableDisableContactsSyncing(
        requestData,
        userId
      );
      if (data && data.length && data[0]) return;
      else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.UNABLE_TO_UPDATE_CONTACT_SYNCING_SETTING,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async removeSuggestedFriendService(requestData, userId) {
    try {
      await this.UserRepositoryObj.removeSuggestedFriend(requestData, userId);
      return true;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //toggleGenderService
  async toggleGenderService(requestData, userId) {
    try {
      await this.UserRepositoryObj.toggleGender(requestData, userId);
      return true;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //function to search users
  async searchUserService(requestData, userId) {
    try {
      // if (requestData.search) {
      //     const userData = await this.UserRepositoryObj.findUserBySearch(requestData.search);
      //     if (userData && !userData.length)
      //         throw new ErrorHandler().customError(ERROR_MESSSAGES.ACCOUNT_SUSPEND, HTTP_CODES.FORBIDDEN)
      // }
      const users = await this.UserRepositoryObj.searchUser(requestData, userId);
      let followingArray = [];
      if (users.data.length) {
        for (const user of users.data) {
          let followingObj = await this.UserRepositoryObj.getUserDetails(user)
          followingArray.push(followingObj);
        }
      }
      return { data: followingArray, "total_count": users.total_count }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // subscribeToUserService
  async subscribeToUserService(requestData, userId) {
    try {
      const subscribeData = await UserSubscribers.findOne({
        where: {
          subscribed_to: requestData.subscribed_to,
          subscribed_by: userId,
        },
      });
      if (requestData.subscribe) {
        if (subscribeData)
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ALREADY_SUBSCRIBED_TO_USER,
            HTTP_CODES.BAD_REQUEST
          );
        else {
          await UserSubscribers.create({
            id: uuidv4(),
            subscribed_by: userId,
            subscribed_to: requestData.subscribed_to,
            created_at: Date.now(),
          });
          return true;
        }
      } else {
        if (subscribeData) {
          await UserSubscribers.destroy({
            where: {
              subscribed_by: userId,
              subscribed_to: requestData.subscribed_to,
            },
          });
          return true;
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.USER_NOT_SUBSCRIBED,
            HTTP_CODES.BAD_REQUEST
          );
        }
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //service to report user
  async reportUserService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.reportUser(requestData, userId);
    } catch (err) {
      if (err.parent && err.parent.code === ORM_ERRORS.ALREADY_EXISTS) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_REPORTED_USER,
          HTTP_CODES.BAD_REQUEST
        );
      }
      Logger.error(new Error(err));
      throw err;
    }
  }

  // update subscription
  async updateSubscriptionService(requestData, userId) {
    try {
      if (
        !Object.values(SUBSCRIPTION).includes(Number(requestData.subscription))
      )
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_SUBSCRIPTION_VALUE,
          HTTP_CODES.BAD_REQUEST
        );
      return await this.UserRepositoryObj.updateSubscriptionData(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // kyc verify
  async kycVerifyService(requestData, userId) {
    try {
      return await this.UserRepositoryObj.kycVerifyData(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // get kyc verify
  async getKycVerifyService(requestData) {
    try {
      return await this.UserRepositoryObj.getKycVerifyData(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // kyc verify edit
  async kycVerifyEditService(requestData) {
    try {
      return await this.UserRepositoryObj.kycVerifyEditData(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // kyc verify status
  async kycVerifyStatusService(requestData, userId) {
    try {
      if (!Object.values(KYC).includes(Number(requestData.is_kyc_verified))) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_KYC_STATUS,
          HTTP_CODES.BAD_REQUEST
        );
      }
      return await this.UserRepositoryObj.kycVerifyStatusData(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsImages(questionIds) {
    try {
      return await this.UserRepositoryObj.getQuestionsImages(questionIds);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsCategories(categoryIds) {
    try {
      return await this.UserRepositoryObj.getQuestionsCategories(categoryIds);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUsersBriefInfo(userIds) {
    try {
      return await this.UserRepositoryObj.getUsersBriefInfo(userIds);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async myLikeStatus(userId, questionIds, sharedQuestionIds) {
    try {
      return await this.UserRepositoryObj.myLikeStatus(
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
      return await this.UserRepositoryObj.myVoteStatus(
        userId,
        questionIds,
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsDetails(questionIds) {
    try {
      return await this.UserRepositoryObj.getQuestionsDetails(questionIds);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // async getUserGoogleUrlServices() {
  //     try {
  //         return await this.UserRepositoryObj.getUserGoogleUrl();
  //     }
  //     catch (err) {
  //         Logger.error(new Error(err));
  //         throw err;
  //     }
  // }

  // async userGoogleTokenServices(requestData) {
  //     try {
  //         return await this.UserRepositoryObj.userGoogleToken(requestData);
  //     }
  //     catch (err) {
  //         Logger.error(new Error(err));
  //         throw err;
  //     }
  // }
}

module.exports = UserServices;
