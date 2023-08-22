const {
  UserModel,
  UserDevicesModel,
  UserContactsModel,
  QuestionCategoryModel,
  QuestionModel,
  QuestionImagesModel,
  QuestionOptionsModels,
  ExpiredJwtModel,
  UserSharedQuestionModel,
  VerificationRequestModel,
  NotificationModel,
  ReportCommentModel,
  ReportedQuestionsModel,
  ReportedUsersModel,
  UserCommentModel,
  RemovedSuggestedFriendsModel,
} = require("../../models");
const Logger = require("../../helpers/Logger");
const Sequelize = require("../../config/connection");
const { QueryTypes } = require("../../config/connection");
const { v4: uuidv4 } = require("uuid");
const { getStartOfDay } = require("../../helpers/Moment");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const {
  pagination,
  convertDayIntoMilliSeconds,
} = require("../../utils/CommonFunctions");
const {
  ROLE_IDS,
  ALL_CATEGORY_ID,
  VERIFICATION_REQUEST_STATUS,
  ERROR_MESSSAGES,
  HTTP_CODES,
} = require("../../utils/Constants");
const {
  verificationRequestStatusNotifications,
} = require("../../components/Report/NotificationServices");
const ErrorHandler = require("../../helpers/ErrorHandler");
const getSignedUrl = require("../../awsfunctions/GetSignedUrl");
const Constants = require("../../utils/Constants");
const { generateOptions } = require("../../utils/CommonFunctions");

class UserRepository {
  async signUpRepository(requestData) {
    try {
      return await UserModel.create(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findPhoneNumber(phoneNumber) {
    try {
      return await UserModel.findOne({
        where: { phone_number: phoneNumber },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateOtp(otp, userId) {
    try {
      return await UserModel.update(
        { otp: otp },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getDataByOtp(otp) {
    try {
      return await UserModel.findOne({ where: { otp: otp } });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }
  async updatePhoneNumberVerificationStatus(userId) {
    try {
      return await UserModel.update(
        { is_phone_verified: true, otp: null },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateProfileData(profileData, userId) {
    try {
      return await UserModel.update(profileData, {
        where: { user_id: userId },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findDataByUserId(userId) {
    try {
      return await UserModel.findOne({ where: { user_id: userId } });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async saveUserDevices(requestData) {
    try {
      return await UserDevicesModel.create(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findByEmail(email) {
    try {
      return await UserModel.findOne({ where: { email: email } });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findByGmailToken(token) {
    try {
      return await UserModel.findOne({ where: { google_id: token } });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findByAppleToken(token) {
    try {
      return await UserModel.findOne({ where: { apple_id: token } });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteSavedContacts(userId) {
    try {
      return await UserContactsModel.destroy({ where: { user_id: userId } });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async saveContacts(saveContactData) {
    try {
      return await UserContactsModel.create(saveContactData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getContacts(requestData, userId) {
    try {
      const query = `SELECT (SELECT COUNT(*) FROM user_contacts WHERE user_id=:userId) AS total_count,user_id,phone_number,created_at,contact_name,contact_id FROM user_contacts  WHERE user_id=:userId
            order by user_contacts.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      return await this.executeSelectRawQuery(query, {
        page_number: Number(requestData.page_number),
        limit: Number(requestData.limit),
        userId: userId,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async executeSelectRawQuery(query, replacements) {
    try {
      return await Sequelize.query(query, {
        replacements: replacements,
        type: QueryTypes.SELECT,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async addQuestions(requestData, userId) {
    const t = await Sequelize.transaction();
    const questionId = uuidv4();
    try {
      let questionsOptionsArray = [];
      const now = Date.now();
      let answerDuration = null;
      let answerExpiry = requestData.expire_at ? requestData.expire_at : null;
      if (requestData.answer_duration) {
        answerDuration = requestData.answer_duration;
        answerExpiry = now + convertDayIntoMilliSeconds(Number(answerDuration));
      }
      await QuestionModel.create(
        {
          question_id: questionId,
          created_by: userId,
          question_date: getStartOfDay(),
          created_at: Date.now(),
          question_title: requestData.question_title,
          question_type: requestData.question_type,
          answer_expiry_time: answerExpiry,
          answer_duration: answerDuration,
        },
        { transaction: t }
      );
      await QuestionCategoryModel.create(
        {
          question_category_id: uuidv4(),
          question_id: questionId,
          category_id: requestData.category_id,
        },
        { transaction: t }
      );
      await QuestionImagesModel.create(
        {
          question_image_id: uuidv4(),
          question_id: questionId,
          image_url: requestData.image_url,
          ratio: String(requestData.ratio) || null,
          width: parseInt(requestData.width) || null,
          height: parseInt(requestData.height) || null,
          question_cover_type: requestData.question_cover_type,
        },
        { transaction: t }
      );
      if (Number(requestData.question_type) === Constants.QUESTION_TYPE.MCQ) {
        for (let x of requestData.options) {
          questionsOptionsArray.push({
            question_option_id: uuidv4(),
            question_id: questionId,
            options: x.name,
            option_number: x.option,
          });
        }
      } else if (
        Number(requestData.question_type) ===
        Constants.QUESTION_TYPE.STAR_RATING
      ) {
        const questionsOptions = generateOptions();
        for (let x of questionsOptions) {
          questionsOptionsArray.push({
            question_option_id: uuidv4(),
            question_id: questionId,
            options: x.name,
            option_number: x.option,
          });
        }
      }
      await QuestionOptionsModels.bulkCreate(questionsOptionsArray, {
        transaction: t,
      });
      await t.commit();
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getAllCatgeories() {
    try {
      const query = `SELECT * FROM "questions_categories_master" WHERE "category_id"!='${ALL_CATEGORY_ID}'`;
      return await this.executeSelectRawQuery(query, {});
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsOnCategories(requestData, userId) {
    try {
      let replacements = {};
      replacements.userId = userId;
      let countQuery = `SELECT COUNT(*) FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id)  INNER JOIN users on users.user_id=questions.created_by WHERE (questions.is_deleted=false AND questions.is_active=true)`;
      let query = `SELECT ({countQuery}) as total_count, questions.*,question_category_mapping.category_id,questions_images.image_url,questions_categories_master.category_name,CONCAT(first_name,' ',last_name) AS "full_name" FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN questions_categories_master USING (category_id) INNER JOIN users on users.user_id=questions.created_by WHERE (questions.is_deleted=false AND questions.is_active=true) `;
      if (requestData.category_id) {
        replacements.category_id = requestData.category_id;
        query += ` AND (question_category_mapping.category_id=:category_id)`;
        countQuery += ` AND (question_category_mapping.category_id=:category_id)`;
      }
      if (requestData.search) {
        replacements.search = `%${requestData.search}%`;
        query += ` AND ("questions"."question_title" ilike :search)`;
        countQuery += ` AND ("questions"."question_title" ilike :search)`;
      }
      if (parseInt(requestData.type) === ROLE_IDS.ADMIN) {
        replacements.roleId = String(ROLE_IDS.ADMIN);
        query += ` AND ("users"."role"=:roleId)`;
        countQuery += `  AND ("users"."role"=:roleId)`;
      }
      if (parseInt(requestData.type) === ROLE_IDS.USER) {
        replacements.roleId = String(ROLE_IDS.USER);
        query += ` AND ("users"."role"=:roleId)`;
        countQuery += `  AND ("users"."role"=:roleId)`;
      }
      query += ` ORDER BY questions.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      replacements.page_number = requestData.page_number
        ? Number(requestData.page_number)
        : 1;
      replacements.limit = requestData.limit ? Number(requestData.limit) : 10;
      query = query.replace("{countQuery}", countQuery);
      return await this.executeSelectRawQuery(query, replacements);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateResetPasswordToken(tokenValue, userId) {
    try {
      return await UserModel.update(
        { reset_password_token: tokenValue },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async insertIntoExpiredJwt(requestData) {
    try {
      return await ExpiredJwtModel.create(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteQuestions(requestData, userId) {
    try {
      await UserSharedQuestionModel.update(
        { is_deleted: true, is_active: false },
        { where: { question_id: requestData.question_id } }
      );
      return await QuestionModel.update(
        { is_deleted: true, is_active: false, updated_by: userId },
        { where: { question_id: requestData.question_id } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateQuestions(requestData, userId) {
    const t = await Sequelize.transaction();
    try {
      let questionsOptionsArray = [];
      await QuestionModel.update(
        {
          updated_by: userId,
          question_title: requestData.question_title,
          updated_at: Date.now(),
        },
        { where: { question_id: requestData.question_id } },
        { transaction: t }
      );
      await QuestionCategoryModel.update(
        { category_id: requestData.category_id },
        { where: { question_id: requestData.question_id } },
        { transaction: t }
      );
      await QuestionImagesModel.update(
        {
          image_url: requestData.image_url,
          ratio: String(requestData.ratio) || null,
          width: parseInt(requestData.width) || null,
          height: parseInt(requestData.height) || null,
        },
        { where: { question_id: requestData.question_id } },
        { transaction: t }
      );
      await QuestionOptionsModels.destroy(
        { where: { question_id: requestData.question_id } },
        { transaction: t }
      );
      for (let x of requestData.options) {
        questionsOptionsArray.push({
          question_option_id: uuidv4(),
          question_id: requestData.question_id,
          options: x.name,
          option_number: x.option,
        });
      }
      await QuestionOptionsModels.bulkCreate(questionsOptionsArray, {
        transaction: t,
      });
      await t.commit();
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async profileAction(requestData, userId) {
    const t = await Sequelize.transaction();
    try {
      let result;
      let rejectReasonArray = [];
      const checkData = await VerificationRequestModel.findOne({
        where: { user_id: requestData.user_id },
        attributes: ["reject_reasons", "id"],
      });
      if (!checkData)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_VERIFICTION_OF_USER,
          HTTP_CODES.BAD_REQUEST
        );
      else if (
        checkData &&
        checkData.dataValues &&
        checkData.dataValues.reject_reasons &&
        !requestData.account_status &&
        checkData.dataValues.reject_reasons.length
      ) {
        checkData.dataValues.reject_reasons.unshift({
          reject_reason: requestData.reject_reason,
          rejected_by: userId,
          rejected_at: Date.now(),
        });
        rejectReasonArray = checkData.dataValues.reject_reasons;
      } else if (
        checkData &&
        checkData.dataValues &&
        !requestData.account_status
      ) {
        rejectReasonArray.push({
          reject_reason: requestData.reject_reason,
          rejected_by: userId,
          rejected_at: Date.now(),
        });
      }
      if (requestData.account_status) {
        result = await VerificationRequestModel.update(
          { status: VERIFICATION_REQUEST_STATUS.ACCEPTED },
          {
            where: { user_id: requestData.user_id },
            returning: true,
            plain: true,
          },
          { transaction: t }
        );
        await UserModel.update(
          { is_officially_verified: true },
          { where: { user_id: requestData.user_id } },
          { transaction: t }
        );
      } else {
        result = await VerificationRequestModel.update(
          {
            reject_reason: requestData.reject_reason,
            status: VERIFICATION_REQUEST_STATUS.REJECTED,
            rejected_by: userId,
            reject_reasons: rejectReasonArray,
          },
          {
            where: { user_id: requestData.user_id },
            returning: true,
            plain: true,
          },
          { transaction: t }
        );
        await UserModel.update(
          { is_officially_verified: false },
          { where: { user_id: requestData.user_id } },
          { transaction: t }
        );
      }
      await t.commit();
      verificationRequestStatusNotifications(requestData, userId, result);
      return result;
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteSuspendAction(requestData) {
    const checkUser = await UserModel.findOne({
      where: { user_id: requestData.user_id },
    });
    if (!checkUser) {
      throw new ErrorHandler().customError(
        ERROR_MESSSAGES.USER_ID_NOT_EXIST,
        HTTP_CODES.BAD_REQUEST
      );
    } else if (requestData.account_status === 1) {
      const checkUserALREADYSUSPEND = await UserModel.findOne({
        where: { user_id: requestData.user_id, is_active: false },
        attributes: ["is_active"],
      });
      if (!checkUserALREADYSUSPEND) {
        await UserDevicesModel.destroy({
          where: { user_id: requestData.user_id },
        });
        return await UserModel.update(
          { is_active: false },
          { where: { user_id: requestData.user_id } }
        );
      }
      throw new ErrorHandler().customError(
        ERROR_MESSSAGES.ALREADY_ACCOUNT_SUSPEND,
        HTTP_CODES.BAD_REQUEST
      );
    } else if (requestData.account_status === 2) {
      const checkUserALREADYDELETED = await UserModel.findOne({
        where: { user_id: requestData.user_id },
        attributes: ["is_deleted"],
      });
      if (checkUserALREADYDELETED) {
        await RemovedSuggestedFriendsModel.destroy({
          where: {
            [Op.or]: [
              { removed_by: requestData.user_id },
              { removed_to: requestData.user_id },
            ],
          },
        });
        await VerificationRequestModel.destroy({
          where: { user_id: requestData.user_id },
        });
        await ExpiredJwtModel.destroy({
          where: { expired_jwt_id: requestData.user_id },
        });
        await NotificationModel.destroy({
          where: {
            [Op.or]: [
              { sender_id: requestData.user_id },
              { receiver_id: requestData.user_id },
            ],
          },
        });
        await QuestionModel.destroy({
          where: {
            [Op.or]: [
              { created_by: requestData.user_id },
              { updated_by: requestData.user_id },
            ],
          },
        });
        await UserSharedQuestionModel.destroy({
          where: { user_id: requestData.user_id },
        });
        await ReportCommentModel.destroy({
          where: { reported_by: requestData.user_id },
        });
        await ReportedQuestionsModel.destroy({
          where: { reported_by: requestData.user_id },
        });
        await ReportedUsersModel.destroy({
          where: {
            [Op.or]: [
              { reported_by: requestData.user_id },
              { reported_to: requestData.user_id },
            ],
          },
        });
        await UserCommentModel.destroy({
          where: { user_id: requestData.user_id },
        });
        await UserContactsModel.destroy({
          where: { user_id: requestData.user_id },
        });
        await UserDevicesModel.destroy({
          where: { user_id: requestData.user_id },
        });
        await UserSharedQuestionModel.destroy({
          where: { user_id: requestData.user_id },
        });
        await UserModel.destroy({ where: { user_id: requestData.user_id } });
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_ACCOUNT_DELETED,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } else if (requestData.account_status === 3) {
      const checkUserALREADYRESTORED = await UserModel.findOne({
        where: { user_id: requestData.user_id, is_active: true },
        attributes: ["is_active"],
      });
      if (!checkUserALREADYRESTORED)
        return await UserModel.update(
          { is_active: true },
          { where: { user_id: requestData.user_id } }
        );
      throw new ErrorHandler().customError(
        ERROR_MESSSAGES.ALREADY_ACCOUNT_RESTORED,
        HTTP_CODES.BAD_REQUEST
      );
    } else {
      throw new ErrorHandler().customError(
        ERROR_MESSSAGES.INVALID_ACCOUNT_STATUS,
        HTTP_CODES.BAD_REQUEST
      );
    }
  }

  async getQuestionDetails(requestData) {
    try {
      const query = `SELECT  questions.*,question_category_mapping.category_id,questions_images.image_url,questions_categories_master.category_name,users.first_name,users.last_name,CONCAT(users.first_name,'',users.last_name) AS full_name,users.profile_picture,users.user_id FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN questions_categories_master USING (category_id) INNER JOIN users ON users.user_id=questions.created_by WHERE (questions.is_deleted=false AND questions.is_active=true) AND question_id=:questionId`;
      return await this.executeSelectRawQuery(query, {
        questionId: requestData.question_id,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionOptionDetails(requestData) {
    try {
      const query = `SELECT question_option_id,options AS name,option_number AS option FROM question_options WHERE question_id=:questionId ORDER BY option_number`;
      return await this.executeSelectRawQuery(query, {
        questionId: requestData.question_id,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionSubmissionList(requestData) {
    try {
      let replacements = {};
      let countQuery = `SELECT COUNT(*) FROM questions INNER JOIN users ON users.user_id=questions.created_by WHERE questions.is_active=true AND questions.is_deleted=false AND users.role=:roleId`;
      let query = `SELECT ({countQuery}) as total_count,user_id,questions.question_title,users.user_name,CONCAT(first_name,'',last_name) AS full_name,first_name,last_name,questions.question_id,questions.created_at FROM questions INNER JOIN users ON users.user_id=questions.created_by WHERE questions.is_active=true AND questions.is_deleted=false AND users.role=:roleId`;
      if (requestData.search && requestData.search.trim()) {
        replacements.search = `%${requestData.search}%`;
        query += ` AND (questions.question_title ilike :search)`;
        countQuery += ` AND (questions.question_title ilike :search)`;
      }
      query += ` ORDER BY questions.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      replacements.page_number = Number(requestData.page_number);
      replacements.limit = Number(requestData.limit);
      replacements.roleId = String(ROLE_IDS.USER);
      query = query.replace("{countQuery}", countQuery);
      return await this.executeSelectRawQuery(query, replacements);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserDetails(requestData) {
    try {
      const query = `SELECT "first_name","last_name",CONCAT(first_name,'',last_name) AS "full_name","email",CONCAT(country_code,'',phone_number) AS phone_number,to_char("date_of_birth", 'MM-DD-YYYY') AS "date_of_birth",county,state,city,user_name,gender,bio,website,address,title,profile_picture FROM "users" WHERE user_id=:userId`;
      return await this.executeSelectRawQuery(query, {
        userId: requestData.user_id,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserVerificationFormDetails(requestData) {
    try {
      const data = await this.executeSelectRawQuery(
        `SELECT request_verification_form.id,request_verification_form.user_id,request_verification_form.user_name,request_verification_form.full_name,request_verification_form.selfie_url,request_verification_form.email,request_verification_form.phone_number,request_verification_form.parent_id,request_verification_form.photo_id_front,request_verification_form.photo_id_back,request_verification_form.status,request_verification_form.user_comment,request_verification_form.created_at,request_verification_form.reject_reasons,identity_type_master.identity_type AS id_type,users.profile_picture,users.first_name,users.last_name FROM request_verification_form INNER JOIN identity_type_master ON identity_type_master.id=request_verification_form.id_type INNER JOIN users ON users.user_id=request_verification_form.user_id WHERE request_verification_form.id=:id`,
        { id: requestData.id }
      );
      if (data && data.length) {
        const [front, back, selfie_url] = await Promise.all([
          getSignedUrl(data[0].photo_id_front),
          getSignedUrl(data[0].photo_id_back),
          getSignedUrl(data[0].selfie_url),
        ]);
        data[0].photo_id_front = front;
        data[0].photo_id_back = back;
        data[0].selfie_url = selfie_url;
        return {
          data: data[0],
          reject_reasons: data[0].reject_reasons ? data[0].reject_reasons : [],
        };
      } else {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUsersList(requestData) {
    try {
      let replacements = {};
      let countQuery = `SELECT COUNT(*) FROM  users WHERE users.role=:roleId`;
      let query = `SELECT ({countQuery}) as total_count,user_id,user_name,CONCAT(first_name,' ',last_name) AS full_name,first_name,last_name,created_at,email,is_active,title,CONCAT(country_code,phone_number) AS phone_number FROM users  WHERE users.role=:roleId`;
      if (requestData.search && requestData.search.trim()) {
        replacements.search = `%${requestData.search}%`;
        if (parseInt(requestData.search_type)) {
          query += ` AND (email ilike :search)`;
          countQuery += ` AND (email ilike :search)`;
        } else if (parseInt(requestData.search)) {
          query += ` AND (first_name ilike :search or last_name ilike :search or CONCAT(first_name,' ',last_name) ilike :search) OR (user_id::varchar ilike :search)`;
          countQuery += ` AND (first_name ilike :search or last_name ilike :search or CONCAT(first_name,' ',last_name) ilike :search) OR (user_id::varchar ilike :search)`;
        } else if (parseInt(requestData.search_type)) {
          query += ` AND (user_name ilike :search)`;
          countQuery += ` AND (user_name ilike :search)`;
        } else {
          query += ` AND ((first_name ilike :search or last_name ilike :search or CONCAT(first_name,' ',last_name) ilike :search) OR (email ilike :search) OR (user_name ilike :search) OR (user_id::varchar ilike :search))`;
          countQuery += ` AND ((first_name ilike :search or last_name ilike :search or CONCAT(first_name,' ',last_name) ilike :search) OR (email ilike :search) OR (user_name ilike :search) OR (user_id::varchar ilike :search))`;
        }
      }
      query += ` ORDER BY users.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      replacements.page_number = Number(requestData.page_number);
      replacements.limit = Number(requestData.limit);
      replacements.roleId = String(ROLE_IDS.USER);
      query = query.replace("{countQuery}", countQuery);
      return await this.executeSelectRawQuery(query, replacements);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getVerificationFormList(requestData) {
    try {
      const [offset, limit] = pagination(
        requestData.page_number,
        requestData.limit
      );
      let whereStatement = {};
      if (requestData.search) {
        whereStatement = {
          [Op.or]: [
            {
              email: {
                [Op.iLike]: `%${requestData.search}%`,
              },
            },
            {
              user_name: {
                [Op.iLike]: `%${requestData.search}%`,
              },
            },
            {
              full_name: {
                [Op.iLike]: `%${requestData.search}%`,
              },
            },
            {
              phone_number: {
                [Op.iLike]: `%${requestData.search}%`,
              },
            },
          ],
        };
      }
      if (requestData.status) {
        whereStatement.status = requestData.status;
      }
      return await VerificationRequestModel.findAndCountAll({
        where: whereStatement,
        limit: limit,
        offset: offset,
        order: [["created_at", "DESC"]],
        attributes: [
          "user_id",
          "id",
          "user_name",
          "full_name",
          "email",
          "phone_number",
          "status",
        ],
        subQuery: false,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getStateAndCountyCount(questionId) {
    try {
      // const query = `SELECT COUNT(state) AS stateCount,COUNT(user_answers.county) AS countyCount,state,user_answers.county FROM user_answers INNER JOIN users USING (user_id) WHERE user_answers.question_id=:questionId GROUP BY state,user_answers.county`
      const query = `SELECT COUNT(state_symbol) AS stateCount,COUNT(county) AS countyCount,state_symbol AS state,
            county FROM user_answers WHERE user_answers.question_id=:questionId GROUP BY state_symbol,county`;
      return await this.executeSelectRawQuery(query, {
        questionId: questionId,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }
}

module.exports = UserRepository;
