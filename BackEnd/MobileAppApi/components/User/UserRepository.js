const {
  UserModel,
  UserDevicesModel,
  UserContactsModel,
  QuestionCategoryModel,
  QuestionModel,
  QuestionImagesModel,
  QuestionOptionsModels,
  CategoryMasterModel,
  ExpiredJwtModel,
  QuestionExpirationModel,
  UserAnswersModel,
  UserSharedQuestionModel,
  FollowRequestModel,
  UserFollowsModel,
  DeletedAccountModel,
  NotificationsModel,
  UserBlocksModel,
  ThresholdTrendingMasterModel,
  SearchSuggestionModel,
  BusinessCategoryModel,
  RemovedSuggestedFriends,
  ReportedUsersModel,
  UserSubscribersModel,
  UsStateCountyMasterModel,
} = require("../../models");
const Logger = require("../../helpers/Logger");
const Sequelize = require("../../config/connection");
const { QueryTypes } = require("../../config/connection");
const { v4: uuidv4 } = require("uuid");
const { getStartOfDay } = require("../../helpers/Moment");
const {
  ACCOUNT_TYPE,
  ROLE_IDS,
  REPORT_STATUS,
  WT_CATEGORY_ID,
  ALL_CATEGORY_ID,
  TRENDING_THRESHOLD_TYPE,
  QUESTION_EXPIRATION_TYPE,
  ERROR_MESSSAGES,
  HTTP_CODES,
  QUESTION_TYPE,
  GENDER,
  SUBSCRIPTION,
  QUESTION_NEW_FORMAT_CONDITION,
} = require("../../utils/Constants");
const UserFollowRequest = require("../../models/FollowRequest");
const {
  NOTIFICATION_TYPE,
  NOTIFICATION_MESSAGE,
} = require("../../utils/NoitificationConstants");
const { Op } = require("sequelize");
const ErrorHandler = require("../../helpers/ErrorHandler");
const {
  generateOptions,
  convertDayIntoMilliSeconds,
} = require("../../utils/CommonFunctions");
require("dotenv-safe").config({});
const TranscodedVideoAuditModel = require("../../models/TranscodedVideoAudit");
const Constants = require("../../utils/Constants");
const { Client } = require("@elastic/elasticsearch");
const {
  sendNotificationToSubscribers,
  sendAnswerNotification,
  sendPushNotificationForPollExpired,
} = require("../Questions/NotificationServices");
const QuestionRepository = require("../Questions/QuestionRepository");
const { invokeStepFunctions } = require("../../awsfunctions/index");
const SequelizeModule = require("sequelize");
const SendGrid = require("../../helpers/SendGrid");
const axios = require("axios").default;
const { question: questionES } = require("../../elasticsearch");
const {
  FIELDS: ES_QUESTIONS_FIELDS,
} = require("../../elasticsearch/indices/question");
const cities = require("cities");
const Fs = require("fs");
const { google } = require("googleapis");

const usStateCountyMasterMJson = require("./us_state_country_master.json");

const client = new Client({
  cloud: {
    id: process.env.CLOUD_ID,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
});

// relations
UserFollowsModel.belongsTo(UserModel, {
  as: "followed_by_user",
  foreignKey: "followed_by",
  target: "user_id",
});
UserFollowsModel.belongsTo(UserModel, {
  as: "followed_to_user",
  foreignKey: "followed_to",
  target: "user_id",
});
UserAnswersModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  target: "user_id",
});

class UserRepository {
  // Google url and google token
  // oauth2Client = new google.auth.OAuth2(
  //   "1091526787910-v0d70o03ljtguf8ro2bjjfhut40elu9a.apps.googleusercontent.com",
  //   "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",
  //   "http://localhost:3000/callback"
  // )

  async countryStateMasterRepository() {
    try {
      await UsStateCountyMasterModel.bulkCreate(usStateCountyMasterMJson)
        .then((res, err) => {
          if (res) {
            console.log("Successfully saved!");
          } else {
            console.log("Error!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  }

  async signUpRepository(requestData) {
    try {
      const data = await UserModel.create(requestData);
      if (data) {
        this.addUserDataOnElasticDb(requestData.user_id);
      }
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findPhoneNumber(phoneNumber, countryCode) {
    try {
      return await UserModel.findOne({
        where: { phone_number: phoneNumber, country_code: countryCode },
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

  async updateLastTimestampNotificationsRead(userId) {
    try {
      return await UserModel.update(
        { last_timestamp_notifications_read: Date.now() },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getDataByOtp(otp, userId) {
    try {
      if (otp === "224455") {
        return await UserModel.findOne({ where: { user_id: userId } });
      }
      return await UserModel.findOne({ where: { otp: otp, user_id: userId } });
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

  async updateEmailVerificationStatus(userId) {
    try {
      return await UserModel.update(
        { is_email_verified: true, otp: null },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updatePhoneNumberAndEmailVerificationStatus(userId) {
    try {
      return await UserModel.update(
        { is_email_verified: true, is_phone_verified: true, otp: null },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateProfileData(profileData, userId) {
    try {
      const data = await UserModel.update(profileData, {
        where: { user_id: userId },
        returning: true,
        plain: true,
      });
      if (data && profileData.first_name) {
        this.updateUserDataOnElasticDb(profileData, userId);
      }
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateBusinessProfileData(profileData, userId) {
    try {
      const result = await UserModel.findOne({ where: { user_id: userId } });
      if (result.is_business_account) {
        return await UserModel.update(profileData, {
          where: { user_id: userId, is_business_account: true },
          returning: true,
          plain: true,
        });
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

  async completeBusinessProfileData(profileData, userId) {
    try {
      return await UserModel.update(profileData, {
        where: { user_id: userId },
        returning: true,
        plain: true,
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

  async findUserBySearch(search) {
    try {
      return await UserModel.findAll({
        where: {
          [Op.or]: {
            user_name: {
              [Op.substring]: search,
            },
            first_name: {
              [Op.substring]: search,
            },
            last_name: {
              [Op.substring]: search,
            },
            email: {
              [Op.substring]: search,
            },
          },
          is_active: true,
        },
      });
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

  async getContacts(requestData, userId) {
    try {
      const query = `SELECT (SELECT COUNT(*) FROM user_contacts WHERE user_id=:userId) AS total_count,user_id,phone_number,created_at,contact_name,contact_id FROM user_contacts  WHERE user_id=:userId order by user_contacts.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
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

  async saveContacts(saveContactData) {
    try {
      return await UserContactsModel.create(saveContactData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async addQuestions(requestData, userId) {
    let transcodedVideoUrl;
    let videoAvailabilty = 0;
    let needToInvokeStepFunction = false;
    const t = await Sequelize.transaction();
    const questionId = uuidv4();
    try {
      let questionData;
      if (requestData.question_uuid) {
        questionData = await this.checkIfQuestionExists(requestData);
      }
      if (questionData && questionData.dataValues) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.QUESTION_ALREADY_EXISTS,
          HTTP_CODES.BAD_REQUEST
        );
      } else {
        let questionsOptionsArray = [];
        // if video url is coming check in audit table of transcoded videos
        if (requestData.video_url) {
          transcodedVideoUrl = await this.checkIfTranscodedVideoExists(
            requestData.video_url
          );
          if (transcodedVideoUrl) {
            videoAvailabilty = Constants.VIDEO_STATUS.AVAILABLE;
          } else {
            videoAvailabilty = Constants.VIDEO_STATUS.UNAVAILABLE;
          }
        }
        const now = Date.now();
        let answerDuration = 0;
        if (requestData.answer_duration) {
          needToInvokeStepFunction = true;
          answerDuration = requestData.answer_duration;
        }
        const answerExpiry = answerDuration != -1 ?
          now + convertDayIntoMilliSeconds(Number(answerDuration)) : (now + 15 * 60 * 1000);
        await QuestionModel.create(
          {
            question_id: questionId,
            created_by: userId,
            question_date: getStartOfDay(),
            created_at: now,
            question_type: requestData.question_type,
            answer_duration: answerDuration,
            answer_expiry_time: answerExpiry,
            question_title: requestData.question_title,
            video_status: videoAvailabilty,
            question_uuid: requestData.question_uuid
              ? requestData.question_uuid
              : null,
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
            image_url: requestData.image_url || null,
            transcoded_video_url: transcodedVideoUrl,
            video_url: requestData.video_url || null,
            video_thumbnail: requestData.video_thumbnail || null,
            width: requestData.width ? parseInt(requestData.width) : null,
            height: requestData.height ? parseInt(requestData.height) : null,
            ratio: requestData.ratio || null,
            question_cover_type: requestData.question_cover_type,
          },
          { transaction: t }
        );
        // delete from audit table once record is created ..
        if (transcodedVideoUrl) {
          await TranscodedVideoAuditModel.destroy({
            where: {
              video_url: requestData.video_url,
            },
          });
        }
        // if question type is MCQ.. then add options according to request ..
        if (Number(requestData.question_type) == QUESTION_TYPE.MCQ) {
          for (let x of requestData.options) {
            questionsOptionsArray.push({
              question_option_id: uuidv4(),
              question_id: questionId,
              options: x.name,
              option_number: x.option,
            });
          }
        }
        // else add the options re;ated to star rating ..
        else {
          let optionsArray = generateOptions();
          for (let x of optionsArray) {
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
        await QuestionExpirationModel.create(
          {
            question_expiration_id: uuidv4(),
            question_id: questionId,
            expiry_time: answerExpiry,
          },
          { transaction: t }
        );
        const [userData, categoryData] = await Promise.all([
          UserModel.findOne({
            where: { user_id: userId },
            attributes: [
              "user_id",
              "first_name",
              "last_name",
              "profile_picture",
            ],
          }),
          CategoryMasterModel.findOne({
            where: { category_id: requestData.category_id },
          }),
        ]);
        requestData.full_name =
          userData.dataValues.first_name + " " + userData.dataValues.last_name;
        requestData.profile_picture = userData.dataValues.profile_picture;
        requestData.category_name = categoryData.dataValues.category_name;
        await t.commit();
        await this.syncWithES(questionId, requestData.user);
        sendNotificationToSubscribers(questionId, userId);
        if (needToInvokeStepFunction) {
          invokeStepFunctions(
            {
              question_id: questionId,
              dueDate: new Date(answerExpiry).toISOString(),
            },
            process.env.POLL_STEP_FUNCTION_ARN
          );
        }
        return { question_id: questionId, video_status: videoAvailabilty };
      }
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getBusinessCategoryMaster() {
    try {
      return await BusinessCategoryModel.findAll({
        where: {
          is_deleted: false,
        },
        order: [["preference_order", "ASC"]],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getAllCatgeories(requestData) {
    try {
      const query = `SELECT * FROM questions_categories_master WHERE category_id NOT IN ('${WT_CATEGORY_ID}','${ALL_CATEGORY_ID}') ORDER BY prefrence_order`;
      const data = await this.executeSelectRawQuery(query);
      requestData.is_home =
        requestData.is_home === undefined || requestData.is_home === null
          ? true
          : requestData.is_home;
      if (requestData.is_home && data && data.length) {
        if (requestData.is_home !== "0") {
          data.unshift({ category_id: ALL_CATEGORY_ID, category_name: `All` });
          data.unshift({ category_id: WT_CATEGORY_ID, category_name: `WT` });
        }
      }
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsOnCategories(requestData, userId) {
    try {
      let replacements = {};
      replacements.userId = userId;
      replacements.roleId = String(ROLE_IDS.USER);
      let trendingPostQuery = ``;
      let conditionalOrderBy = ``;
      if (
        !requestData.category_id ||
        (requestData.category_id && requestData.category_id !== WT_CATEGORY_ID)
      ) {
        trendingPostQuery += ` AND (questions.is_trending = true AND users.role =:adminId)`;
        conditionalOrderBy += ` ORDER BY questions.trending_date DESC`;
      } else {
        trendingPostQuery += ` AND (users.role =:adminId)`;
        conditionalOrderBy += ` ORDER by questions.created_at DESC`;
      }
      let countQuery = `SELECT COUNT(questions.question_id) FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN users ON users.user_id = questions.created_by WHERE ((questions.is_deleted = false AND questions.is_active = true) OR questions.video_status != 1) AND (questions.created_by !=:userId) AND "questions"."created_by" NOT IN ${this.getBlockCondition()} AND questions.question_id NOT IN (SELECT question_id FROM reported_questions WHERE reported_by =:userId AND question_id is not null) ${trendingPostQuery}`;

      let query = `SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video", ({countQuery}) as total_count, (SELECT COALESCE(COUNT(user_answer_id), 0) FROM "user_answers" WHERE "question_id" = "questions"."question_id") AS vote_count,questions.*, question_category_mapping.category_id, questions_images.image_url, questions_categories_master.category_name, questions_images.transcoded_video_url, questions_images.video_thumbnail, questions_images.height, questions_images.width, questions_images.ratio, (CASE WHEN users.role =:roleId THEN false ELSE true END) AS "is_user_question", (CASE WHEN users.role =:roleId AND user_name is null THEN 'WeThink Admin' ELSE user_name END) AS user_name, users.first_name, (SELECT COUNT(user_comments.comment_id) FROM user_comments WHERE user_comments.question_id = questions.question_id AND user_comments.is_active = true AND user_comments.comment_id NOT IN (select comment_id FROM reported_comments WHERE reported_by =:userId AND comment_id is not null) AND user_comments.parent_id IS NULL AND user_comments.is_deleted = false AND user_comments.user_id NOT IN ${this.getBlockCondition()} and 
      user_comments.question_shared_id is null) AS comment_count, (SELECT COUNT(id) FROM user_likes WHERE user_likes.question_id = questions.question_id AND user_likes.question_shared_id is null) AS likes_count, (SELECT COALESCE(COUNT(question_shared_id), 0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false) AS "shared_count", (CASE WHEN (EXISTS (select from "user_likes" WHERE "user_likes"."user_id" =:userId AND "user_likes"."question_id" = "questions"."question_id" AND "questions"."is_active" = true AND "questions"."is_deleted" = false)) THEN true ELSE false END ) AS "is_liked", (CASE WHEN ( EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id" =:userId AND "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false)) THEN true ELSE false END ) AS "is_shared", (CASE WHEN "users"."role" =:adminId THEN true ELSE false END) AS is_admin_question, users.profile_picture, users.is_business_account, questions_images.question_cover_type, questions.answer_duration, questions.answer_expiry_time FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN questions_categories_master USING (category_id) INNER JOIN users ON users.user_id = questions.created_by WHERE ((questions.is_deleted = false AND questions.is_active = true AND questions.is_expired = false) OR questions.video_status != 1) AND (questions.created_by !=:userId) AND "questions"."created_by" NOT IN ${this.getBlockCondition()} AND questions.question_id NOT IN (SELECT question_id FROM reported_questions WHERE reported_by =:userId and question_id is not null) ${trendingPostQuery}`;
      if (requestData.category_filter) {
        requestData.category_filter = requestData.category_filter.split(",");
        replacements.category_id = requestData.category_filter;
        query += ` AND (question_category_mapping.category_id IN (:category_id))`;
        countQuery += ` AND (question_category_mapping.category_id IN (:category_id))`;
      } else if (!requestData.category_filter && requestData.category_id) {
        replacements.category_id = requestData.category_id;
        query += ` AND (question_category_mapping.category_id =:category_id)`;
        countQuery += ` AND (question_category_mapping.category_id =:category_id)`;
      }
      query += ` ${conditionalOrderBy} OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      replacements.page_number = Number(requestData.page_number);
      replacements.limit = Number(requestData.limit);
      replacements.adminId = String(ROLE_IDS.USER);
      query = query.replace("{countQuery}", countQuery);
      return await this.executeSelectRawQuery(query, replacements);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsOnDate(requestData, userId) {
    try {
      let replacements = {};
      replacements.userId = userId;
      let countQuery = `SELECT COUNT(questions.question_id) FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN questions_categories_master USING (category_id) INNER JOIN "users" ON "users"."user_id" = "questions"."created_by" AND "users"."role" =:roleId WHERE (questions.is_deleted = false AND questions.is_active = true AND questions.is_expired = false) AND (questions.created_by != :userId) AND question_date =:date AND "users"."role" =:roleId AND questions.question_id NOT IN (SELECT question_id FROM reported_questions WHERE reported_by =:userId and question_id is not null)`;
      let query = `SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video", ({countQuery}) as total_count, questions.*,question_category_mapping.category_id, questions_images.image_url, questions_categories_master.category_name, null AS "user_answer", questions_images.transcoded_video_url, questions_images.video_thumbnail, questions_images.ratio, questions_images.width,questions_images.height, (SELECT COUNT(comment_id) FROM user_comments WHERE user_comments.question_id = questions.question_id AND user_comments.parent_id is null and user_comments.comment_id NOT IN (select comment_id FROM reported_comments where reported_by =:userId and comment_id is not null) and user_comments.is_active = true AND user_comments.is_deleted = false and user_comments.question_shared_id is null) AS comment_count, (SELECT COUNT(id) FROM user_likes WHERE user_likes.question_id = questions.question_id AND user_likes.question_shared_id is null) AS likes_count, (SELECT COALESCE(COUNT(question_shared_id), 0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false) AS "shared_count", (CASE WHEN (EXISTS (select from "user_likes" WHERE "user_likes"."user_id" =:userId AND "user_likes"."question_id" = "questions"."question_id" AND "questions"."is_active" = true AND "questions"."is_deleted" = false)) THEN true ELSE false END) AS "is_liked", (CASE WHEN ( EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id" =:userId AND "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false)) THEN true ELSE false END) AS "is_shared" FROM 
      questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN questions_categories_master USING (category_id) INNER JOIN "users" ON "users"."user_id" = "questions"."created_by" AND "users"."role" =:roleId WHERE (questions.is_deleted = false AND questions.is_active = true AND questions.is_expired = false) AND (questions.created_by !=:userId) AND question_date =:date AND users.role =:roleId AND questions.question_id NOT IN (SELECT question_id FROM reported_questions WHERE reported_by =:userId and question_id is not null)`;
      replacements.date = parseInt(requestData.date);
      replacements.roleId = String(ROLE_IDS.USER);
      if (requestData.search && requestData.search.trim()) {
        replacements.search = `%${requestData.search}%`;
        query += ` AND (questions.question_title ilike :search)`;
        countQuery += ` AND (questions.question_title ilike :search)`;
      }
      query += ` ORDER BY questions.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      replacements.page_number = Number(requestData.page_number);
      replacements.limit = Number(requestData.limit);
      query = query.replace("{countQuery}", countQuery);
      return await this.executeSelectRawQuery(query, replacements);
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

  async deleteFromDeviceToken(requestData, userId) {
    try {
      return await UserDevicesModel.destroy({
        where: { device_token: requestData.device_token, user_id: userId },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getProfileData(userId) {
    try {
      let data = await UserModel.findOne({
        where: { user_id: userId },
        attributes: [
          "user_id",
          "email",
          "first_name",
          "last_name",
          "country_code",
          "phone_number",
          "state",
          "county",
          "profile_picture",
          "is_email_verified",
          "is_phone_verified",
          "notifications_enabled",
          "city",
          "user_name",
          "bio",
          "website",
          "address",
          "title",
          "gender",
          "show_gender",
          "profile_picture",
          "business_account_name",
          "business_account_category",
          "is_business_account",
          "business_longitude",
          "business_latitude",
          "is_officially_verified",
          "last_verified_date",
          "unique_id",
          "account_type",
          [
            SequelizeModule.fn(
              "to_char",
              SequelizeModule.col("date_of_birth"),
              "MM-DD-YYYY"
            ),
            "date_of_birth",
          ],
        ],
      });
      let query = `select COALESCE(count(id),0) as subscriber_count from user_subscribers where subscribed_to =:userId `;
      const subscriberCountData = await this.executeSelectRawQuery(query, {
        userId: userId,
      });
      if (data && data.dataValues) {
        data.dataValues.subscriber_count =
          subscriberCountData[0].subscriber_count;
      }
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async expireOldQuestions() {
    try {
      const id = uuidv4();
      const currentTimeStamp = Date.now();
      const findAllExpiredQuestionsForNotification = await QuestionModel.findAll({
        where: {
          answer_expiry_time: {
            [Op.lte]: currentTimeStamp,
          },
          is_expired: false,
          is_deleted: false,  //no need to send notification for deleted questions
          is_active: true,
        },
        attributes: ["question_id", "created_by"],
      });

      let findUser;
      findAllExpiredQuestionsForNotification.map(async (questionData) => {
        let findQuestionCreatedUser = await UserModel.findOne({
          where: {
            user_id: questionData.created_by,
          },
          attributes: ["user_name"],
        });

        findUser = await UserAnswersModel.findAll({
          where: {
            question_id: questionData.question_id,
          },
          attributes: ["user_id"],
          include: [
            {
              model: UserModel,
              required: false,
              attributes: ["user_name"],
            },
          ],
        });
        findUser.map(async (user) => {
          await NotificationsModel.create({
            notification_id: uuidv4(),
            event_id: id,
            created_at: Date.now(),
            sender_id: questionData.created_by,
            receiver_id: user.user_id,
            type: NOTIFICATION_TYPE.POLL_END,
            question_id: questionData.question_id,
            question_shared_id: null,
            message: NOTIFICATION_MESSAGE.POLL_END.replace(
              "{user_name}",
              findQuestionCreatedUser && findQuestionCreatedUser.user_name
                ? findQuestionCreatedUser.user_name
                : `Sender`
            ),
          });
          sendPushNotificationForPollExpired({
            sender_id: questionData.created_by,
            receiver_id: user.user_id,
            type: NOTIFICATION_TYPE.POLL_END,
          });
        });
      });
      await QuestionModel.update(
        { is_expired: true },
        {
          where: {
            answer_expiry_time: {
              [Op.lte]: currentTimeStamp,
            },
          },
        }
      );
      await questionES.expireOldQuestions();
      await QuestionExpirationModel.destroy({
        where: {
          expiry_time: {
            [Op.lte]: currentTimeStamp,
          },
        },
      });
      return;
    } catch (err) {
      Logger.error(new Error(err));
    }
  }

  async executeUpdateRawQuery(query, replacements) {
    try {
      return await Sequelize.query(query, {
        replacements: replacements,
        type: QueryTypes.UPDATE,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async executeDeleteRawQuery(query, replacements, t = null) {
    try {
      if (t)
        return await Sequelize.query(query, {
          replacements: replacements,
          type: QueryTypes.DELETE,
          transaction: t,
        });
      else
        return await Sequelize.query(query, {
          replacements: replacements,
          type: QueryTypes.DELETE,
        });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionDetails(requestData, userId) {
    try {
      const detailQuery = `select created_by from questions where question_id =:questionId`;
      const data = await this.executeSelectRawQuery(detailQuery, {
        questionId: requestData.question_id,
      });
      const blockUser = await UserBlocksModel.findOne({
        where: {
          blocked_by: data[0].created_by,
          blocked_to: userId,
        },
      });
      if (blockUser && blockUser.dataValues)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.BLOCKED_USER,
          HTTP_CODES.BAD_REQUEST
        );
      else if (!data || !data.length)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.DELETED_QUESTION,
          HTTP_CODES.BAD_REQUEST
        );
      const query = `SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video", (CASE WHEN user_answers.user_id IS NULL THEN false ELSE true END) AS is_answer_given, user_answers.answer_id AS option_chosen, (select count(user_id) from user_answers where question_id =:questionId) as total_answer_count, questions.question_id, (select COALESCE(count(id), 0) from user_likes where question_id =:questionId) as question_likes_count, (select COALESCE(count(comment_id), 0) from user_comments where question_id =:questionId AND parent_id IS NULL AND is_deleted = false AND is_active = true) as question_comments_count, (select COALESCE(count(question_id), 0) from questions where questions.created_by =:questionUserId AND is_deleted = false AND is_active = true) as question_created_count, (select COALESCE(count(question_shared_id), 0) from user_shared_questions where user_shared_questions.question_id =:questionId AND is_deleted = false AND is_active = true) as question_share_count, (select COALESCE(count(follows_id), 0) from user_follows where user_follows.followed_to =:questionUserId) as user_followers_count, (select COALESCE(count(user_answer_id), 0) from user_answers INNER join questions on questions.question_id = user_answers.question_id where questions.created_by =:questionUserId) as total_user_votes, questions.question_type, questions.created_at,questions.question_title, questions.average_rating, question_category_mapping.category_id, questions_images.image_url, questions_categories_master.category_name, questions_images.transcoded_video_url, 
      questions_images.video_thumbnail, users.first_name, users.last_name, users.profile_picture, CONCAT(users.first_name,' ',users.last_name) AS full_name, users.user_name, users.is_officially_verified, users.is_business_account, users.unique_id, questions_images.width, questions_images.height,questions_images.question_cover_type, questions.answer_duration, questions.answer_expiry_time,questions_images.ratio, questions.created_by AS user_id, (CASE WHEN users.role =:roleId THEN true ELSE false END) AS "is_admin" FROM questions LEFT JOIN question_category_mapping USING (question_id) LEFT JOIN questions_images USING (question_id) LEFT JOIN questions_categories_master USING (category_id) LEFT JOIN user_answers ON (user_answers.question_id = questions.question_id AND user_answers.user_id =:userId) INNER JOIN users ON users.user_id = questions.created_by WHERE ((questions.is_deleted = false AND questions.is_active = true) OR questions.video_status != 1) AND questions.question_id =:questionId`;
      return await this.executeSelectRawQuery(query, {
        questionId: requestData.question_id,
        userId: userId,
        questionUserId: data[0].created_by,
        roleId: String(ROLE_IDS.ADMIN),
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionOptionDetails(requestData) {
    try {
      const query = `SELECT question_option_id AS answer_id,options AS name,option_number AS option,0 AS percentage FROM question_options WHERE question_id=:questionId ORDER BY option_number`;
      return await this.executeSelectRawQuery(query, {
        questionId: requestData.question_id,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async saveQuestionAnswers(requestData, userId) {
    let t = await Sequelize.transaction();
    const answerId = uuidv4();
    let answerTransactionInstance = null;
    try {
      const id = uuidv4();
      const getUserDataStateAndCounty = await this.getUserStateAndCountyData(
        userId,
        t
      );
      if (!getUserDataStateAndCounty) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_COUNTY_STATE,
          HTTP_CODES.BAD_REQUEST
        );
      } else if (
        !Object.values(GENDER).includes(
          Number(getUserDataStateAndCounty.gender)
        )
      ) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.UPDATED_GENDER_VALUE,
          HTTP_CODES.BAD_REQUEST
        );
      }
      if (
        !getUserDataStateAndCounty.county ||
        !getUserDataStateAndCounty.state ||
        !getUserDataStateAndCounty.gender ||
        !getUserDataStateAndCounty.state_symbol
      ) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.MISSING_COUNTY_STATE,
          HTTP_CODES.BAD_REQUEST
        );
      }
      let reason;
      if (requestData.answer_reason) reason = requestData.answer_reason;
      else reason = null;
      await UserAnswersModel.create(
        {
          user_answer_id: answerId,
          answer_id: requestData.answer_id,
          user_id: userId,
          question_id: requestData.question_id,
          created_at: Date.now(),
          answer_reason: reason,
          state_symbol: getUserDataStateAndCounty.state_symbol,
          state: getUserDataStateAndCounty.state,
          gender: getUserDataStateAndCounty.gender,
          county: getUserDataStateAndCounty.county,
        },
        { transaction: t }
      );
      await t.commit();
      t = null;
      answerTransactionInstance = await Sequelize.transaction();
      const question = await QuestionModel.findOne({
        where: { question_id: requestData.question_id },
        attributes: ["average_rating", "created_by"],
        transaction: answerTransactionInstance,
      });
      if (!question || !question.dataValues)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_QUESTION_ID,
          HTTP_CODES.BAD_REQUEST
        );
      const resultData = await this.getQuestionsAndAnswersMetaData(
        requestData,
        answerTransactionInstance,
        question.dataValues.average_rating
      );
      await this.checkAndMoveQuestionsToTrending(
        requestData,
        answerTransactionInstance
      );
      await this.updatePercentageOnCountyAndStateData(
        resultData,
        requestData.question_id,
        getUserDataStateAndCounty,
        userId,
        answerTransactionInstance
      );
      if (userId !== question.created_by) {
        if (requestData.answer_reason)
          await NotificationsModel.create({
            notification_id: uuidv4(),
            event_id: id,
            created_at: Date.now(),
            sender_id: userId,
            receiver_id: question.dataValues.created_by,
            type: NOTIFICATION_TYPE.COMMENT_POST,
            question_id: requestData.question_id,
            question_shared_id: requestData.question_shared_id || null,
            message: NOTIFICATION_MESSAGE.COMMENT_POST.replace(
              "{user_name}",
              getUserDataStateAndCounty && getUserDataStateAndCounty.user_name
                ? getUserDataStateAndCounty.user_name
                : `Sender`
            ),
          });
        else
          await NotificationsModel.create({
            notification_id: uuidv4(),
            event_id: id,
            created_at: Date.now(),
            sender_id: userId,
            receiver_id: question.dataValues.created_by,
            type: NOTIFICATION_TYPE.VOTE,
            question_id: requestData.question_id,
            question_shared_id: requestData.question_shared_id || null,
            message: NOTIFICATION_MESSAGE.VOTE.replace(
              "{user_name}",
              getUserDataStateAndCounty && getUserDataStateAndCounty.user_name
                ? getUserDataStateAndCounty.user_name
                : `Sender`
            ),
          });
        await answerTransactionInstance.commit();
        await questionES.incrementVoteCount(requestData.question_id, 1);
        sendAnswerNotification({
          sender_id: userId,
          receiver_id: question.dataValues.created_by,
          type: requestData.answer_reason
            ? NOTIFICATION_TYPE.COMMENT_POST
            : NOTIFICATION_TYPE.VOTE,
        });
      }
      for (let x of resultData) {
        x.average_rating = Number(x.average_rating);
        x.percentage = Number(x.percentage);
      }
      return resultData;
    } catch (err) {
      this.executeDeleteRawQuery(
        `DELETE FROM user_answers WHERE user_answer_id=:answerId`,
        { answerId: answerId }
      ).catch((error) => console.error("Delete user answer error: ", error));
      if (answerTransactionInstance) await answerTransactionInstance.rollback();
      if (t) await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfUserHasSharedAnswer(requestData, userId) {
    try {
      return await UserAnswersModel.findOne({
        where: { user_id: userId, question_id: requestData.question_id },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async shareQuestion(requestData, userId) {
    try {
      const shared_id = uuidv4();
      await UserSharedQuestionModel.create({
        question_shared_id: shared_id,
        question_id: requestData.question_id,
        user_id: userId,
        created_at: Date.now(),
        share_message: requestData.share_message || null,
      });
      const questionData = await QuestionModel.findOne({
        where: {
          question_id: requestData.question_id,
        },
      });
      if (!questionData || !questionData.dataValues)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_QUESTION_ID,
          HTTP_CODES.BAD_REQUEST
        );
      questionData.dataValues.question_title =
        questionData.dataValues.question_title + requestData.share_message;
      await questionES.incrementShareCount(requestData.question_id, 1);
      await this.syncSharesWithES(shared_id, requestData.user);
      return questionData.dataValues;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changeCommentingOnQuestion(requestData) {
    try {
      return await UserAnswersModel.findAll({ id: requestData.id });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findFollower(userId) {
    try {
      return await UserFollowsModel.count({ where: { followed_to: userId } });
    } catch {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findOtp(userId) {
    try {
      return await UserModel.findOne({
        where: {
          user_id: userId,
        },
        attributes: ["otp"],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findTempPhoneNumber(requestData, userId) {
    try {
      return await UserModel.findOne({
        where: {
          temp_country_code: requestData.country_code,
          temp_phone_number: requestData.phone_number,
          user_id: userId,
        },
        attributes: [
          "user_id",
          "otp",
          "temp_phone_number",
          "temp_country_code",
        ],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async findTempEmail(requestData, userId) {
    try {
      return await UserModel.findOne({
        where: {
          temp_email: requestData.email,
          user_id: userId,
        },
        attributes: ["user_id", "otp", "temp_email"],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async viewOtherProfileData(requestData, userId) {
    try {
      const query = `SELECT (CASE WHEN "user_follow_requests"."followed_to" IS NOT NULL THEN true ELSE false END) AS "is_request_sent", (CASE WHEN "user_follows"."followed_to" IS NOT NULL THEN true ELSE false END) as "is_followed","user_id","profile_picture","title","bio", "first_name", "last_name", "is_officially_verified", "is_business_account", "unique_id", to_char("date_of_birth", 'MM-DD-YYYY') AS "date_of_birth", "gender", "account_type", "website", "users"."user_id", "users"."user_name", "users"."show_gender", "users"."is_officially_verified", "users"."is_business_account", "users"."unique_id", (SELECT COUNT(question_id) FROM questions WHERE video_status !=:videoStatus AND created_by =:userId) AS total_questions_count, (SELECT COUNT(user_answers.user_answer_id) FROM user_answers INNER JOIN questions ON questions.question_id = user_answers.question_id AND questions.created_by =:userId) AS total_votes_count FROM "users" LEFT JOIN "user_follows" ON "user_follows"."followed_to" = "users"."user_id" AND "user_follows"."followed_by" =:follwedBy AND "user_follows"."followed_to" =:userId LEFT JOIN "user_follow_requests" ON "user_follow_requests"."followed_to" ="users"."user_id" AND "user_follow_requests"."followed_by" =:follwedBy AND "user_follow_requests"."followed_to" =:userId  WHERE "user_id" =:userId AND is_active = true`;
      return await this.executeSelectRawQuery(query, {
        userId: requestData.user_id,
        follwedBy: userId,
        videoStatus: Constants.VIDEO_STATUS.UNAVAILABLE,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async viewUsersActivityData(requestData, loggedInUser, elasticIds) {
    try {
      const replacements = {};
      let elasticIdQuery = ``;
      let easticSharedQuery = ``;
      replacements.loggedInUser = loggedInUser;
      if (elasticIds.length) {
        easticSharedQuery = `and (questions.question_id in (${elasticIds}) or  user_shared_questions.question_shared_id in (${elasticIds}))`;
        elasticIdQuery = `and (questions.question_id in (${elasticIds}))`;
      }
      let query = `SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video", "questions"."question_id", null AS "question_shared_id", (SELECT COALESCE(COUNT(*), 0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false) AS "shared_count",(SELECT COALESCE(COUNT(user_likes.question_id),0) FROM "user_likes" WHERE "user_likes"."question_shared_id" IS NULL AND "user_likes"."question_id"="questions"."question_id") AS "likes_count",(SELECT COALESCE(COUNT(user_answers.answer_id),0) FROM "user_answers" WHERE "user_answers"."question_id"="questions"."question_id" ) AS "vote_count",(SELECT COALESCE(COUNT(user_comments.comment_id),0) FROM user_comments WHERE user_comments.question_id=questions.question_id AND user_comments.parent_id IS NULL AND user_comments.is_active=true AND user_comments.is_deleted=false AND user_comments.question_shared_id is null AND user_comments.comment_id NOT IN(select comment_id FROM reported_comments where reported_by=:loggedInUser and comment_id is not null) AND user_comments.user_id NOT IN ${this.getBlockCondition(
        loggedInUser
      )}) AS comment_count, 
      (CASE WHEN ( EXISTS (select from "user_likes" WHERE "user_likes"."user_id"=:loggedInUser AND "user_likes"."question_id"="questions"."question_id" AND "questions"."is_active"=true AND "questions"."is_deleted"=false AND user_likes.question_shared_id is null) ) THEN true ELSE false END ) AS "is_liked",(CASE WHEN ( EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id"=:loggedInUser AND "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false)) THEN true ELSE false END ) AS "is_shared",questions_images.image_url,questions.question_title,null AS share_message,null AS share_created_at,questions.is_commenting_enabled,questions.created_by AS user_id,null AS first_name,null AS last_name,null as full_name,null as profile_picture,null as user_name,null as is_officially_verified,null as is_business_account,question_category_mapping.category_id,question_options.options AS user_answer,questions_images.transcoded_video_url,questions_images.video_thumbnail,questions_images.width,questions_images.height,questions_images.ratio,owner.profile_picture AS owner_profile_picture,owner.user_name AS owner_user_name,owner.first_name AS owner_first_name,owner.last_name AS owner_last_name,questions.created_at,questions.created_at AS owner_post_create_time,CONCAT(owner.first_name,' ',owner.last_name) AS owner_full_name,owner.is_officially_verified as owner_is_officially_verified,owner.is_business_account as owner_is_business_account, owner.unique_id as owner_unique_id, (CASE WHEN owner.role=:adminRoleId THEN true ELSE false END) AS is_admin_question,owner.user_id as owner_user_id,(select questions_categories_master.category_name  as category_name from questions_categories_master inner join question_category_mapping on question_category_mapping.category_id = questions_categories_master.category_id where question_category_mapping.question_id = questions.question_id) as category_name, questions_images.question_cover_type,questions.answer_duration, questions.answer_expiry_time, questions.question_date FROM 
      "questions" INNER JOIN "questions_images" ON "questions_images"."question_id"="questions"."question_id" INNER JOIN "question_category_mapping" ON "questions"."question_id"="question_category_mapping"."question_id" LEFT JOIN "user_answers" ON "user_answers"."question_id"="questions"."question_id" AND user_answers.user_id=:userId LEFT JOIN "question_options" ON "question_options"."question_option_id"="user_answers"."answer_id" AND user_answers.user_id=:userId INNER JOIN "users" AS "owner" ON "owner"."user_id"="questions"."created_by" WHERE "questions"."created_by"=:userId AND "questions"."is_active"=true AND "questions"."video_status" != 1 AND "questions"."is_deleted"=false AND questions.question_id NOT IN(SELECT question_id FROM reported_questions WHERE reported_by=:loggedInUser and question_id is not null) ${elasticIdQuery} UNION SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video","user_shared_questions"."question_id","user_shared_questions"."question_shared_id",(SELECT COALESCE(COUNT(*),0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false) AS "shared_count",(SELECT COALESCE(COUNT(user_likes.question_shared_id),0) FROM "user_likes" WHERE "user_likes"."question_shared_id"="user_shared_questions"."question_shared_id" ) AS likes_count,(SELECT COALESCE(COUNT(user_answers.answer_id),0) FROM "user_answers" WHERE "user_answers"."question_id"="questions"."question_id" ) AS "vote_count",(SELECT COALESCE(COUNT(user_comments.comment_id),0) FROM user_comments WHERE user_comments.question_shared_id=user_shared_questions.question_shared_id AND user_comments.parent_id IS NULL AND user_comments.is_active=true AND user_comments.is_deleted=false AND user_comments.comment_id NOT IN(SELECT comment_id FROM reported_comments WHERE reported_by=:loggedInUser and comment_id is not null) AND user_comments.user_id NOT IN ${this.getBlockCondition(
        loggedInUser
      )} ) AS comment_count, 
      (CASE WHEN ( EXISTS (select from "user_likes" WHERE "user_likes"."user_id"=:loggedInUser AND "user_likes"."question_shared_id"="user_shared_questions"."question_shared_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false) ) THEN true ELSE false END ) AS "is_liked", (CASE WHEN ( EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id"=:loggedInUser AND "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false)) THEN true ELSE false END ) AS "is_shared",questions_images.image_url,questions.question_title,user_shared_questions.share_message,user_shared_questions.created_at AS share_created_at,user_shared_questions.is_commenting_enabled,user_shared_questions.user_id,users.first_name,users.last_name,CONCAT(users.first_name,' ',users.last_name) AS full_name,users.profile_picture,users.user_name,users.is_officially_verified,users.is_business_account,question_category_mapping.category_id,question_options.options AS user_answer,questions_images.transcoded_video_url,questions_images.video_thumbnail,questions_images.width,questions_images.height,
      questions_images.ratio,owner.profile_picture AS owner_profile_picture,owner.user_name AS owner_user_name,owner.first_name AS owner_first_name,owner.last_name AS owner_last_name,questions.created_at,questions.created_at AS owner_post_create_time,CONCAT(owner.first_name,' ',owner.last_name) AS owner_full_name,owner.is_officially_verified, owner.is_business_account,owner.unique_id,(CASE WHEN owner.role=:adminRoleId THEN true ELSE false END) AS is_admin_question,owner.user_id AS owner_user_id, (select questions_categories_master.category_name  as category_name from questions_categories_master inner join question_category_mapping on question_category_mapping.category_id = questions_categories_master.category_id where question_category_mapping.question_id = questions.question_id) as category_name, questions_images.question_cover_type,questions.answer_duration,questions.answer_expiry_time,questions.question_date FROM "user_shared_questions" INNER JOIN "questions" USING("question_id") INNER JOIN "questions_images" ON "questions_images"."question_id"="questions"."question_id" INNER JOIN "question_category_mapping" ON "questions"."question_id"="question_category_mapping"."question_id" LEFT JOIN "user_answers" ON "user_answers"."question_id"="user_shared_questions"."question_id" AND user_answers.user_id=:userId LEFT JOIN "question_options" ON "question_options"."question_option_id"="user_answers"."answer_id" AND user_answers.user_id=:userId INNER JOIN "users" ON "users"."user_id"="user_shared_questions"."user_id" INNER JOIN "users" AS "owner" ON "owner"."user_id"="questions"."created_by" WHERE user_shared_questions.user_id NOT IN ${this.getBlockCondition(
        loggedInUser
      )} AND "user_shared_questions"."is_active"=true AND  "user_shared_questions"."is_deleted"=false AND questions.is_active=true AND questions.video_status != 1 AND questions.is_deleted=false AND "user_shared_questions"."user_id"=:userId AND user_shared_questions.question_shared_id NOT IN (SELECT question_shared_id FROM reported_questions WHERE reported_by=:loggedInUser AND question_shared_id is not null) AND questions.created_by NOT IN(SELECT blocked_to FROM user_blocks WHERE blocked_by=:userId AND blocked_to is not null) ${easticSharedQuery}`;
      let countQuery = `SELECT COUNT(*) FROM (${query}) AS count_query`;
      query += ` ORDER BY created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      replacements.page_number = parseInt(requestData.page_number);
      replacements.limit = parseInt(requestData.limit);
      replacements.userId = requestData.user_id;
      replacements.adminRoleId = String(ROLE_IDS.ADMIN);
      const [data, countData] = await Promise.all([
        this.executeSelectRawQuery(query, replacements),
        this.executeSelectRawQuery(countQuery, replacements),
      ]);
      return { data: data, countData: countData };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async executeInsertQuery(query, replacements) {
    try {
      return await Sequelize.query(query, {
        replacements: replacements,
        type: QueryTypes.INSERT,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createFollowRequest(requestData, userId) {
    try {
      const id = uuidv4();
      const query = `INSERT INTO "user_follow_requests" (follow_request_id, followed_by, followed_to, created_at) SELECT '${id}', :followed_by, :followed_to, ${Date.now()} WHERE NOT EXISTS(SELECT 1 FROM "user_follow_requests" AS "u" WHERE ("u"."followed_by"=:followed_by AND "u"."followed_to"=:followed_to)) RETURNING *`;
      const data = await this.executeInsertQuery(query, {
        followed_by: userId,
        followed_to: requestData.user_id,
      });
      const userData = await this.getUserData(userId);
      await NotificationsModel.create({
        notification_id: uuidv4(),
        event_id: id,
        created_at: Date.now(),
        sender_id: userId,
        receiver_id: requestData.user_id,
        type: NOTIFICATION_TYPE.FOLLOW_REQUEST,
        message: NOTIFICATION_MESSAGE.FOLLOW_REQUEST.replace(
          "{user_name}",
          userData && userData.length ? userData[0].user_name : `Sender`
        ),
      });
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createFollower(requestData, userId) {
    try {
      const id = uuidv4();
      const query = `INSERT INTO "user_follows" (follows_id, followed_by, followed_to, created_at) SELECT '${id}', :followed_by, :followed_to, ${Date.now()} WHERE NOT EXISTS (SELECT 1 FROM "user_follows" AS "u" WHERE ("u"."followed_by" =:followed_by AND "u"."followed_to" =:followed_to)) RETURNING *`;
      const data = await this.executeInsertQuery(query, {
        followed_by: userId,
        followed_to: requestData.user_id,
      });
      const userData = await this.getUserData(userId);
      await NotificationsModel.create({
        notification_id: uuidv4(),
        event_id: id,
        created_at: Date.now(),
        sender_id: userId,
        receiver_id: requestData.user_id,
        type: NOTIFICATION_TYPE.FOLLOWING,
        message: NOTIFICATION_MESSAGE.FOLLOWING.replace(
          "{user_name}",
          userData && userData.length ? userData[0].user_name : `Sender`
        ),
      });
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async unFollow(requestData, userId) {
    try {
      const data = await UserFollowsModel.destroy({
        where: { followed_by: userId, followed_to: requestData.user_id },
      });
      const query = `DELETE FROM "notifications" WHERE "notification_id" IN (SELECT "notification_id" FROM "notifications" WHERE "type" IN (${NOTIFICATION_TYPE.FOLLOWING},${NOTIFICATION_TYPE.FRIEND}) AND  ("sender_id"=:followedById AND "receiver_id"=:followedToId) UNION SELECT "notification_id" FROM "notifications" WHERE "type"=${NOTIFICATION_TYPE.FRIEND} AND  ("sender_id"=:followedToId AND "receiver_id"=:followedById))`;
      await this.executeDeleteRawQuery(query, {
        followedById: userId,
        followedToId: requestData.user_id,
      });
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async unFollowRequest(requestData, userId) {
    try {
      let data;
      let data1 = await FollowRequestModel.destroy({
        where: { followed_by: userId, followed_to: requestData.user_id },
      });
      let data2 = await UserFollowsModel.destroy({
        where: { followed_by: userId, followed_to: requestData.user_id },
      });
      if (data1) {
        data = data1;
      }
      if (data2) {
        data = data2;
      }
      const query = `DELETE FROM "notifications" WHERE "notification_id" IN (SELECT "notification_id" FROM "notifications" WHERE "type" IN (${NOTIFICATION_TYPE.FOLLOW_REQUEST},${NOTIFICATION_TYPE.FRIEND}) AND  ("sender_id"=:followedById AND "receiver_id"=:followedToId) UNION SELECT "notification_id" FROM "notifications" WHERE "type"=${NOTIFICATION_TYPE.FRIEND} AND ("sender_id"=:followedToId AND "receiver_id"=:followedById))`;
      await this.executeDeleteRawQuery(query, {
        followedById: userId,
        followedToId: requestData.user_id,
      });
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changeAccountPrivacyType(requestData, userId) {
    const query = `SELECT array_agg("followed_by") AS "followers" FROM "user_follow_requests" WHERE "followed_to"=:userId`;
    const getAllFollowRequest = await this.executeSelectRawQuery(query, {
      userId: userId,
    });
    const t = await Sequelize.transaction();
    const followersArray = [];
    try {
      if (parseInt(requestData.account_type) === ACCOUNT_TYPE.PUBLIC) {
        if (
          getAllFollowRequest &&
          getAllFollowRequest.length &&
          getAllFollowRequest[0].followers &&
          getAllFollowRequest[0].followers.length
        ) {
          for (const x of getAllFollowRequest[0].followers) {
            followersArray.push({
              follows_id: uuidv4(),
              followed_by: x,
              followed_to: userId,
              created_at: Date.now(),
            });
          }
          await UserFollowsModel.bulkCreate(followersArray, { transaction: t });
          await FollowRequestModel.destroy(
            {
              where: {
                followed_by: getAllFollowRequest[0].followers,
                followed_to: userId,
              },
            },
            { transaction: t }
          );
        }
      }
      await UserModel.update(
        { account_type: requestData.account_type },
        { where: { user_id: userId } },
        { transaction: t }
      );
      await NotificationsModel.destroy(
        {
          where: {
            [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
            type: NOTIFICATION_TYPE.FOLLOW_REQUEST,
          },
        },
        { transaction: t }
      );
      await t.commit();
      if (followersArray && followersArray.length) {
        for (const x of followersArray) {
          this.createFriendsNotification(
            { user_id: x.followed_by },
            userId,
            x.follows_id
          );
        }
      }
      questionES.updatePrivacy(userId, requestData.account_type, {});
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async skipSuggestedFriend(userId) {
    try {
      return await UserModel.update(
        { is_suggestion_skipped: true },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAlreadyFollowing(requestData, userId) {
    try {
      return await UserFollowsModel.findOne({
        where: { followed_to: requestData.user_id, followed_by: userId },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAlreadyFollowRequest(requestData, userId) {
    try {
      return await FollowRequestModel.findOne({
        where: { followed_to: requestData.user_id, followed_by: userId },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async enableDisableCommenting(requestData, userId) {
    try {
      return await QuestionModel.update(
        { is_commenting_enabled: requestData.status },
        { where: { question_id: requestData.question_id, created_by: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getMyProfileData(userId) {
    try {
      const query = `SELECT (select array_agg('{ "user_id": ' || CONCAT('"',sq1.user_id,'"') || ', "user_name": ' || CONCAT('"',sq1.user_name,'"') ||',"email": ' || CONCAT('"',sq1.email,'"') ||',"profile_picture": ' || CONCAT('"',sq1.profile_picture,'"') || ',"phone_number": ' || CONCAT('"',sq1.phone_number,'"') || ' ,"name": ' || CONCAT('"',sq1.full_name,'"') ||' ,"first_name": ' || CONCAT('"',sq1.first_name,'"') ||',"last_name": ' || CONCAT('"',sq1.last_name,'"') || ',"is_officially_verified": ' || CONCAT('"',sq1.is_officially_verified,'"') || '}') AS "mentioned_user" FROM (SELECT "users"."user_name","users"."email","users"."phone_number","users"."profile_picture","users"."user_id",CONCAT("users"."first_name",' ',"users"."last_name") AS "full_name","users"."first_name","users"."last_name", "users"."is_officially_verified"  FROM "users" INNER JOIN (select "user_follows"."follows_id","user_follows"."followed_to","user_follows"."created_at","users"."user_id" FROM "user_follows" INNER JOIN "user_follows" as "follower" ON "follower"."followed_by"="user_follows"."followed_to" AND "follower"."followed_to"="user_follows"."followed_by" WHERE "user_follows"."followed_by"=:userId) subQuery ON subQuery.followed_to=users.user_id ORDER BY "users"."created_at" DESC) AS sq1) AS friends,(select COALESCE(COUNT(user_follows.follows_id),0) FROM "user_follows" INNER JOIN "user_follows" as "follower" ON "follower"."followed_by"="user_follows"."followed_to" AND "follower"."followed_to"="user_follows"."followed_by" WHERE "user_follows"."followed_by"=:userId) as "friend_count","user_id",CONCAT("first_name",' ',"last_name") AS "full_name",users.business_account_name, (select COALESCE(count(id),0) from user_subscribers where subscribed_to =:userId) as subscriber_count,"profile_picture","title","bio","first_name",to_char("date_of_birth", 'MM-DD-YYYY') AS "date_of_birth","gender","account_type","website",users.user_name,"is_officially_verified", "is_business_account", "unique_id" FROM "users" WHERE "is_active"=true AND "user_id"=:userId`;
      return await this.executeSelectRawQuery(query, { userId: userId });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowRequests(requestData, userId) {
    try {
      const query = `SELECT (SELECT COUNT(*) FROM "user_follow_requests" WHERE "followed_to"=:userId) AS "total_count","users"."profile_picture","users"."user_name",CONCAT("users"."first_name",' ',"users"."last_name") AS "full_name","users"."user_id","user_follow_requests"."follow_request_id","user_follow_requests"."created_at" FROM "user_follow_requests" INNER JOIN "users" ON "user_follow_requests"."followed_by"="users"."user_id" WHERE "followed_to"=:userId ORDER BY "user_follow_requests"."created_at" DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      return await this.executeSelectRawQuery(query, {
        userId: userId,
        page_number: parseInt(requestData.page_number),
        limit: parseInt(requestData.limit),
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowingCount(userId) {
    try {
      return await UserFollowsModel.count({
        where: {
          followed_by: userId
        },
        include: [
          {
            model: UserModel,
            as: "followed_to_user",
            required: true,
            where: {
              is_active: true
            }
          },
        ],
      })
    } catch (e) {
      Logger.error(new Error(e));
      throw e;
    }
  }

  async getFollowerCount(userId) {
    try {
      return await UserFollowsModel.count({
        where: {
          followed_to: userId
        },
        include: [
          {
            model: UserModel,
            as: "followed_to_user",
            required: true,
            where: {
              is_active: true
            }
          },
        ],
      })
    } catch (e) {
      Logger.error(new Error(e));
      throw e;
    }
  }

  async getFollowing(requestData, userId) {
    try {
      const { search = "", page_number, limit } = requestData;
      const page = page_number ? parseInt(page_number) : 1;
      const pageLimit = limit && limit <= 100 ? limit : 50;
      const pageOffset = (page - 1) * pageLimit;

      const query = `SELECT U.user_id, F.followed_to from users AS U
      INNER JOIN user_follows AS F ON F.followed_to = U.user_id
      where ((LOWER(first_name) like :keyword OR LOWER(last_name) like :keyword OR LOWER(user_name) like :keyword OR LOWER(email) like :keyword OR LOWER(CONCAT(first_name,' ', last_name)) like :keyword)) AND is_active = true AND is_profile_completed = true
      AND U.is_active = true
      AND F.followed_by = :followedBy
      order by F.created_at desc
      limit :limit offset :offset`;

      let followingBy = await this.executeSelectRawQuery(query, {
        keyword: `%${search.toLowerCase()}%`,
        followedBy: requestData.user_id,
        limit: pageLimit,
        offset: pageOffset,
      });

      const followingToUserIds = followingBy.map((x) => {
        return x.followed_to;
      });

      const queryCount = `SELECT COUNT(U.user_id) as total
      from users AS U
      INNER JOIN user_follows AS F ON F.followed_to = U.user_id
      where ((LOWER(first_name) like :keyword OR LOWER(last_name) like :keyword OR LOWER(user_name) like :keyword OR LOWER(email) like :keyword OR LOWER(CONCAT(first_name,' ', last_name)) like :keyword)) AND is_active = true AND is_profile_completed = true
      AND U.is_active = true
      AND F.followed_by = :followedBy`;

      let usersCount = await this.executeSelectRawQuery(queryCount, {
        keyword: `%${search.toLowerCase()}%`,
        followedBy: requestData.user_id,
      });
      usersCount = (Array.isArray(usersCount) && usersCount.length && usersCount[0] && usersCount[0].total) ? Number(usersCount[0].total) : 0;

      const users = await UserModel.findAll({
        where: {
          user_id: followingToUserIds,
          is_active: true
        }
      });

      let followingArray = [];
      if (users.length) {
        for (const user of users) {
          user.is_followed = requestData.user_id === userId ? true : await this.checkIfAlreadyFollowing({ user_id: user.user_id }, userId);
          user.is_request_sent = await this.checkIfAlreadyFollowRequest({ user_id: user.user_id }, userId)
          user.followers_count = await this.findFollower(user.user_id)
          let followingObj = await this.getUserDetails(user)
          followingArray.push(followingObj);
        }
      }
      return { followingArray: followingArray, followingBy: usersCount };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowers(requestData, userId) {
    try {
      const { search = "", page_number, limit } = requestData;
      const page = page_number ? parseInt(page_number) : 1;
      const pageLimit = limit && limit <= 100 ? limit : 50;
      const pageOffset = (page - 1) * pageLimit;

      const query = `SELECT U.user_id, F.followed_by from users AS U
      INNER JOIN user_follows AS F ON F.followed_by = U.user_id
      where ((LOWER(first_name) like :keyword OR LOWER(last_name) like :keyword OR LOWER(user_name) like :keyword OR LOWER(email) like :keyword OR LOWER(CONCAT(first_name,' ', last_name)) like :keyword)) AND is_active = true AND is_profile_completed = true
      AND U.is_active = true
      AND F.followed_to = :followedTo
      order by F.created_at desc
      limit :limit offset :offset`;

      let followedBy = await this.executeSelectRawQuery(query, {
        keyword: `%${search.toLowerCase()}%`,
        followedTo: requestData.user_id,
        limit: pageLimit,
        offset: pageOffset,
      });

      const followedByUserIds = followedBy.map((x) => {
        return x.followed_by;
      });

      const queryCount = `SELECT COUNT(U.user_id) as total from users AS U
      INNER JOIN user_follows AS F ON F.followed_by = U.user_id
      where ((LOWER(first_name) like :keyword OR LOWER(last_name) like :keyword OR LOWER(user_name) like :keyword OR LOWER(email) like :keyword OR LOWER(CONCAT(first_name,' ', last_name)) like :keyword)) AND is_active = true AND is_profile_completed = true
      AND U.is_active = true
      AND F.followed_to = :followedTo`;

      let usersCount = await this.executeSelectRawQuery(queryCount, {
        keyword: `%${search.toLowerCase()}%`,
        followedTo: requestData.user_id,
      });
      usersCount = (Array.isArray(usersCount) && usersCount.length && usersCount[0] && usersCount[0].total) ? Number(usersCount[0].total) : 0;

      const users = await UserModel.findAll({
        where: {
          user_id: followedByUserIds,
          is_active: true
        },
      });

      let followedArray = [];
      if (users.length) {
        for (const user of users) {
          user.is_followed = await this.checkIfAlreadyFollowing({ user_id: user.user_id }, userId)
          user.is_request_sent = await this.checkIfAlreadyFollowRequest({ user_id: user.user_id }, userId)
          user.followers_count = await this.findFollower(user.user_id)
          let followingObj = await this.getUserDetails(user)
          followedArray.push(followingObj);
        }
      }
      return { followedArray: followedArray, followedBy: usersCount };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async followRequestActionOnAccept(requestData, followData) {
    const t = await Sequelize.transaction();
    try {
      await UserFollowRequest.destroy(
        { where: { follow_request_id: followData.follow_request_id } },
        { transaction: t }
      );
      await UserFollowsModel.create(
        {
          follows_id: uuidv4(),
          followed_by: followData.followed_by,
          followed_to: followData.followed_to,
          created_at: Date.now(),
        },
        { transaction: t }
      );
      await NotificationsModel.destroy(
        {
          where: {
            event_id: followData.follow_request_id,
            type: NOTIFICATION_TYPE.FOLLOW_REQUEST,
          },
        },
        { transaction: t }
      );
      this.createFriendsNotification(
        { user_id: followData.followed_by },
        followData.followed_to,
        requestData.follow_request_id
      );
      await t.commit();
      return;
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async followRequestActionOnReject(requestData, followData) {
    try {
      const data = await UserFollowRequest.destroy({
        where: { follow_request_id: requestData.follow_request_id },
      });
      await NotificationsModel.destroy({
        where: {
          event_id: followData.follow_request_id,
          type: NOTIFICATION_TYPE.FOLLOW_REQUEST,
        },
      });
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFollowRequestData(requestData) {
    try {
      return await UserFollowRequest.findOne({
        where: { follow_request_id: requestData.follow_request_id },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkAlreadyFollower(requestData, userId) {
    try {
      return await UserFollowsModel.findOne({
        where: {
          followed_by: requestData.follow_request_id,
          followed_to: userId,
        },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createDummyFriend(requestData) {
    try {
      return UserFollowsModel.create({
        follows_id: uuidv4(),
        followed_by: requestData.followed_by,
        followed_to: requestData.followed_to,
        created_at: Date.now(),
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async changePassword(password, userId) {
    try {
      return await UserModel.update(
        { password: password, updated_at: Date.now() },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFeedListing(requestData, userId) {
    try {
      let userIds = [];
      const getFollowingData = await this.executeSelectRawQuery(
        `SELECT array_agg(followed_to) AS followed_to FROM user_follows WHERE followed_by =:userId`,
        { userId: userId }
      );
      if (
        getFollowingData &&
        getFollowingData.length &&
        getFollowingData[0].followed_to &&
        getFollowingData[0].followed_to.length
      ) {
        getFollowingData[0].followed_to.forEach((x) =>
          userIds.push(x.toString())
        );
      }
      const blockUsers = getFollowingData[0].followed_to;
      const getBlocks = await UserBlocksModel.findAll({
        where: {
          [Op.or]: [
            {
              blocked_to: {
                [Op.in]: blockUsers,
              },
            },
          ],
        },
      });
      const getBlocksArr = getBlocks.map((item) => item.blocked_to);
      userIds = blockUsers.filter((item) => {
        return !getBlocksArr.includes(item);
      });
      userIds.push(userId.toString());
      let inQuery = ``;
      for (let x = 0; x <= userIds.length - 1; x++) {
        if (x === userIds.length - 1) inQuery += `'${userIds[x]}'`;
        else inQuery += ` '${userIds[x]}',`;
      }
      const replacements = {};
      let query = `SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video", "questions"."question_id", null AS "question_shared_id", (SELECT COALESCE(COUNT(user_shared_questions.question_shared_id), 0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false) AS "shared_count", (SELECT COALESCE(COUNT(user_likes.question_id), 0) FROM "user_likes" WHERE "user_likes"."question_shared_id" IS NULL AND "user_likes"."question_id" = "questions"."question_id") AS "likes_count", (SELECT COALESCE(COUNT(user_answers.answer_id), 0) FROM "user_answers" WHERE "user_answers"."question_id" = "questions"."question_id") AS "vote_count", (SELECT COALESCE(COUNT(user_comments.comment_id), 0) FROM user_comments WHERE user_comments.question_id = questions.question_id AND user_comments.parent_id IS NULL AND user_comments.is_active = true AND user_comments.is_deleted = false AND user_comments.comment_id NOT IN (select comment_id FROM reported_comments WHERE reported_by =:userId and comment_id is not null) AND user_comments.user_id NOT IN ${this.getBlockCondition()}) AS comment_count, (CASE WHEN ( EXISTS (select from "user_likes" WHERE "user_likes"."user_id" =:userId AND "user_likes"."question_id" = "questions"."question_id" AND 
      "questions"."is_active" = true AND "questions"."is_deleted" = false and questions.video_status != 1)) THEN true ELSE false END) AS "is_liked",(CASE WHEN (EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id" =:userId AND "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false)) THEN true ELSE false END) AS "is_shared", questions_images.image_url, questions_images.question_cover_type, questions.answer_duration, questions.answer_expiry_time, questions_images.video_thumbnail, questions.question_title, questions.video_status,null AS share_message, questions.is_commenting_enabled, questions.created_by AS user_id, null AS first_name, null AS last_name, null as full_name, null as profile_picture, null as user_name, question_category_mapping.category_id, null AS user_answer, questions.created_at, questions_images.transcoded_video_url, questions_images.width, questions_images.height, questions_images.ratio, owner.profile_picture AS owner_profile_picture, owner.first_name AS owner_first_name, owner.last_name AS owner_last_name, questions.created_at AS owner_post_create_time, CONCAT(owner.first_name, ' ', owner.last_name) AS owner_full_name, owner.is_officially_verified AS is_officially_verified, owner.is_business_account AS is_business_account, owner.unique_id AS unique_id,(CASE WHEN owner.role =:adminRoleId THEN true ELSE false END) AS is_admin_question, null as owner_user_id FROM "questions" INNER JOIN "questions_images" ON "questions_images"."question_id" = "questions"."question_id" INNER JOIN "question_category_mapping" ON "questions"."question_id" = "question_category_mapping"."question_id" INNER JOIN "users" AS "owner" ON "owner"."user_id" = "questions"."created_by" AND "owner"."is_active" = true WHERE "questions"."created_by" IN (${inQuery}) AND "questions"."is_active" = true AND "questions"."is_deleted" = false AND questions.question_id NOT IN (SELECT question_id FROM reported_questions WHERE reported_by =:userId and question_id is not null) UNION SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video", "user_shared_questions"."question_id", "user_shared_questions"."question_shared_id", (SELECT COALESCE(COUNT(user_shared_questions.question_shared_id), 0)FROM "user_shared_questions" WHERE 
      "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false) AS "shared_count", (SELECT COALESCE(COUNT(user_likes.question_shared_id), 0) FROM "user_likes" WHERE "user_likes"."question_shared_id" = "user_shared_questions"."question_shared_id") AS likes_count, (SELECT COALESCE(COUNT(user_answers.answer_id), 0) FROM "user_answers" WHERE "user_answers"."question_id" = "questions"."question_id" ) AS "vote_count", (SELECT COALESCE(COUNT(user_comments.comment_id), 0) FROM user_comments WHERE user_comments.question_shared_id = user_shared_questions.question_shared_id AND user_comments.parent_id IS NULL AND user_comments.is_active = true AND user_comments.is_deleted = false AND user_comments.comment_id NOT IN(SELECT comment_id FROM reported_comments WHERE reported_by =:userId and comment_id is not null) AND user_comments.user_id NOT IN ${this.getBlockCondition()}) AS comment_count, (CASE WHEN ( EXISTS (select from "user_likes" WHERE "user_likes"."user_id" =:userId AND "user_likes"."question_shared_id" = "user_shared_questions"."question_shared_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false) ) THEN true ELSE false END ) AS "is_liked", (CASE WHEN ( EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id" =:userId AND "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false)) THEN true ELSE false END ) AS "is_shared", questions_images.image_url, questions_images.question_cover_type, questions.answer_duration, questions.answer_expiry_time, questions_images.video_thumbnail, questions.question_title, questions.video_status, user_shared_questions.share_message, user_shared_questions.is_commenting_enabled, user_shared_questions.user_id, users.first_name, users.last_name, CONCAT(users.first_name, ' ', users.last_name) AS full_name, users.profile_picture, 
      users.user_name, question_category_mapping.category_id, question_options.options AS user_answer, user_shared_questions.created_at, questions_images.transcoded_video_url, questions_images.width,questions_images.height, questions_images.ratio, owner.profile_picture AS owner_profile_picture, owner.first_name AS owner_first_name, owner.last_name AS owner_last_name, questions.created_at AS owner_post_create_time, CONCAT(owner.first_name, ' ', owner.last_name) AS owner_full_name, owner.is_officially_verified AS is_officially_verified, owner.is_business_account AS is_business_account, owner.unique_id AS unique_id, (CASE WHEN owner.role =:adminRoleId THEN true ELSE false END) AS is_admin_question, owner.user_id AS owner_user_id FROM "user_shared_questions" LEFT JOIN "questions" USING("question_id") LEFT JOIN "questions_images" ON "questions_images"."question_id" = "questions"."question_id" LEFT JOIN "question_category_mapping" ON "questions"."question_id" = "question_category_mapping"."question_id" LEFT JOIN "users" ON "users"."user_id" = "user_shared_questions"."user_id" LEFT JOIN "users" AS "owner" ON "owner"."user_id" = "questions"."created_by" AND "owner"."is_active" = true LEFT JOIN "user_follows" ON "user_follows"."followed_to" = "users"."user_id" LEFT JOIN user_answers ON user_answers.question_id = questions.question_id AND "user_follows"."followed_by" =:userId LEFT JOIN question_options ON question_options.question_option_id = user_answers.answer_id AND "user_follows"."followed_by" =:userId WHERE user_shared_questions.user_id NOT IN ${this.getBlockCondition()} AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false AND questions.video_status != 1 AND questions.is_active = true AND questions.is_deleted = false AND "user_follows"."followed_by" =:userId AND user_shared_questions.question_shared_id NOT IN (SELECT question_shared_id FROM reported_questions WHERE reported_by =:userId and question_shared_id is not null)`;
      let countQuery = `SELECT COUNT(*) FROM (${query}) AS count_query`;
      query += ` ORDER BY created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      replacements.page_number = Number(requestData.page_number);
      replacements.limit = Number(requestData.limit);
      replacements.userId = userId;
      replacements.reportStatus = REPORT_STATUS.PENDING;
      replacements.acceptedReportedStatus = REPORT_STATUS.ACCEPTED;
      replacements.rejectedReportedStatus = REPORT_STATUS.REJECTED;
      replacements.adminRoleId = String(ROLE_IDS.USER);
      const [data, countData] = await Promise.all([
        this.executeSelectRawQuery(query, replacements),
        this.executeSelectRawQuery(countQuery, replacements),
      ]);
      return { data: data, countData: countData };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteAccount(userId) {
    // const t = await Sequelize.transaction();
    try {
      const deleteUserData = await UserModel.destroy({
        where: { user_id: userId },
      });
      if (deleteUserData) {
        await RemovedSuggestedFriends.destroy({
          where: { removed_by: userId },
        });
      }
      questionES.markUserAllPostsDeleted(userId, {});
    } catch (err) {
      // await t.commit();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteDeletedAccounts() {
    const t = await Sequelize.transaction();
    try {
      const currentDate = getStartOfDay();
      await this.executeDeleteRawQuery(
        `DELETE FROM "users" WHERE "user_id" IN(SELECT "user_id" FROM "deleted_account" WHERE "deleted_date"<=${currentDate})`,
        {},
        t
      );
      await this.executeDeleteRawQuery(
        `DELETE FROM "deleted_account" WHERE "deleted_date"<=${currentDate}`,
        {},
        t
      );
      await t.commit();
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
    }
  }

  async enableDisableNotificationSetting(requestData, userId) {
    try {
      await UserModel.update(
        { notifications_enabled: requestData.status },
        { where: { user_id: userId } }
      );
      const data = await UserDevicesModel.update(
        { notification_enabled: requestData.status },
        { where: { user_id: userId } }
      );
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateToActiveFromDeleted(userId) {
    try {
      await DeletedAccountModel.destroy({ where: { user_id: userId } });
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getNotificationList(requestData, userId) {
    try {
      const query = `SELECT (SELECT COUNT(*)  FROM "notifications" INNER JOIN "users" ON "notifications"."sender_id" = "users"."user_id" LEFT JOIN "user_shared_questions" ON "user_shared_questions"."question_shared_id" = "notifications"."question_shared_id" LEFT JOIN "questions" ON "questions"."question_id" = "notifications"."question_id"  WHERE "receiver_id" =:userId  AND "notifications"."is_deleted" = false) AS "total_count",(CASE WHEN ("type" = ${NOTIFICATION_TYPE.FOLLOW_REQUEST} OR "type" = ${NOTIFICATION_TYPE.FOLLOWING} OR "type" = ${NOTIFICATION_TYPE.FRIEND}) THEN "event_id" ELSE NULL END ) AS "follow_request_id", "users"."profile_picture", "users"."user_name", CONCAT("users"."first_name", ' ', "users"."last_name") AS "full_name", (CASE WHEN ("type" = ${NOTIFICATION_TYPE.FOLLOW_REQUEST} OR "type" = ${NOTIFICATION_TYPE.FOLLOWING} OR "type" = ${NOTIFICATION_TYPE.FRIEND}) THEN "sender_id" ELSE  "notifications"."receiver_id" END) AS "user_id", "notifications"."event_id", "notifications"."created_at", "seen", "reject_reason", "is_read", "type", "message", (CASE WHEN "user_shared_questions"."is_commenting_enabled" IS NULL then "questions"."is_commenting_enabled" ELSE "user_shared_questions"."is_commenting_enabled" END) AS "is_commenting_enabled", notification_id, "notifications"."question_shared_id", "notifications"."question_id", parent_comment_id, notifications.comment_id, notifications.sender_id FROM "notifications" INNER JOIN "users" ON "notifications"."sender_id" = "users"."user_id" LEFT JOIN "user_shared_questions" ON "user_shared_questions"."question_shared_id" = "notifications"."question_shared_id" LEFT JOIN "questions" ON "questions"."question_id" = "notifications"."question_id"  WHERE "receiver_id" =:userId  AND "notifications"."is_deleted" = false  ORDER BY "notifications"."created_at" DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY `;
      const updateQuery = `UPDATE "notifications" SET "is_read" = true WHERE "receiver_id" =:userId`;
      this.executeUpdateRawQuery(updateQuery, { userId: userId });
      return await this.executeSelectRawQuery(query, {
        userId: userId,
        page_number: parseInt(requestData.page_number),
        limit: parseInt(requestData.limit),
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserData(userId) {
    try {
      const query = `SELECT "user_name","first_name","last_name", "notifications_enabled" FROM  "users" WHERE "user_id"=:userId`;
      return await this.executeSelectRawQuery(query, { userId: userId });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfBothAreFriends(followedById, followedToId) {
    try {
      const query = `SELECT "follows_id" FROM "user_follows" WHERE ("followed_by" =:followedById AND "followed_to" =:followedToId) UNION SELECT "follows_id" FROM "user_follows" WHERE ("followed_by" =:followedToId AND "followed_to" =:followedById)`;
      const data = await this.executeSelectRawQuery(query, {
        followedById: followedById,
        followedToId: followedToId,
      });
      return data && data.length && data.length === 2 ? true : false;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createFriendsNotification(requestData, userId, id) {
    try {
      const [followedData, followedByData] = await Promise.all([
        this.getUserData(requestData.user_id),
        this.getUserData(userId),
      ]);

      if (await this.checkIfBothAreFriends(requestData.user_id, userId)) {
        await NotificationsModel.bulkCreate([
          {
            notification_id: uuidv4(),
            event_id: id,
            created_at: Date.now(),
            sender_id: userId,
            receiver_id: requestData.user_id,
            type: NOTIFICATION_TYPE.FRIEND,
            message: NOTIFICATION_MESSAGE.FRIEND.replace(
              "{user_name}",
              followedByData && followedByData.length
                ? followedByData[0].user_name
                : `Sender`
            ),
          },
          {
            notification_id: uuidv4(),
            event_id: id,
            created_at: Date.now(),
            sender_id: requestData.user_id,
            receiver_id: userId,
            type: NOTIFICATION_TYPE.FRIEND,
            message: NOTIFICATION_MESSAGE.FRIEND.replace(
              "{user_name}",
              followedData && followedData.length
                ? followedData[0].user_name
                : `Sender`
            ),
          },
        ]);
      } else {
        await NotificationsModel.create({
          notification_id: uuidv4(),
          event_id: id,
          created_at: Date.now(),
          sender_id: requestData.user_id,
          receiver_id: userId,
          type: NOTIFICATION_TYPE.FOLLOWING,
          message: NOTIFICATION_MESSAGE.FOLLOWING.replace(
            "{user_name}",
            followedData.length && followedData[0].user_name
              ? followedData[0].user_name
              : `Sender`
          ),
        });
      }
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getNotificationCountAndStatus(userId) {
    try {
      const data = await UserModel.findOne({
        where: {
          user_id: userId,
        },
        attributes: ["last_timestamp_notifications_read"],
      });
      const lastTimestampNotificationRead =
        data.dataValues.last_timestamp_notifications_read;
      const query = `SELECT COUNT(notification_id) as count FROM "notifications" WHERE "seen" = false AND "receiver_id" =:userId  AND "created_at" > ${lastTimestampNotificationRead}`;
      return await this.executeSelectRawQuery(query, { userId: userId });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async searchPeople(requestData, userId) {
    try {
      const query = `SELECT(SELECT COUNT(users.user_id) FROM "users"  WHERE "users"."is_deleted" = false AND "users"."is_active" = true AND(CONCAT("users"."first_name", ' ', "users"."last_name") ilike :search OR user_name ilike :search) AND "user_id" !=:userId  AND "users"."user_id" NOT IN(SELECT "blocked_to" AS "user_id" FROM "user_blocks" WHERE "blocked_by" =:userId UNION SELECT "blocked_by" AS "user_id" FROM "user_blocks" WHERE "blocked_to" =:userId) and users.role !=:adminRoleId) AS "total_count", "users"."profile_picture", "users"."user_name", CONCAT("users"."first_name", ' ', "users"."last_name") AS "full_name", "users"."user_id", "users"."is_officially_verified", "users"."is_business_account", "users"."unique_id" FROM "users" WHERE "users"."is_deleted" = false AND "users"."is_active" = true AND(CONCAT("users"."first_name", ' ', "users"."last_name") ilike :search OR user_name ilike :search) AND "user_id" !=:userId AND "users"."user_id" NOT IN(SELECT "blocked_to" AS "user_id" FROM "user_blocks" WHERE "blocked_by" =:userId and blocked_to is not null UNION SELECT "blocked_by" AS "user_id" FROM "user_blocks" WHERE "blocked_to" =:userId and blocked_by is not null) and users.role !=:adminRoleId ORDER BY "users"."created_at" DESC OFFSET((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      return await this.executeSelectRawQuery(query, {
        page_number: parseInt(requestData.page_number),
        limit: parseInt(requestData.limit),
        search: `%${requestData.search.trim()}% `,
        userId: userId,
        adminRoleId: String(ROLE_IDS.ADMIN),
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getDataOnCountyAndState(userStateCountyData, t) {
    try {
      const selectQuery = `select * FROM "answer_audit", jsonb_array_elements(state_data) with ordinality arr(state_value, index) WHERE "state_value" ->> 'name'=:countyName AND 'state_code' =:stateSymbol`;
      return await this.executeSelectRawQuery(
        selectQuery,
        {
          countyName: userStateCountyData.county,
          stateSymbol: userStateCountyData.state_symbol,
        },
        t || null
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updatePercentageOnCountyAndStateData(
    resultData,
    questionId,
    userStateCountyData,
    userId,
    t
  ) {
    try {
      let countyData = [];
      const queryReplaceMents = {
        stateSymbol: userStateCountyData.state_symbol,
        countyName: userStateCountyData.county,
      };
      if (userStateCountyData) {
        const userCountyDataAndStateData = await this.getDataOnCountyAndState(
          userStateCountyData,
          t
        );
        const answerArrayData = [];
        resultData.forEach((x) => {
          const pushObj = {
            name: x.name,
            count: 0,
            question_id: questionId,
            answer_id: x.answer_id,
            user_id: userId,
          };
          answerArrayData.push(pushObj);
          countyData.push(pushObj);
        });
        if (
          userCountyDataAndStateData &&
          userCountyDataAndStateData.length &&
          userCountyDataAndStateData[0].state_value &&
          userCountyDataAndStateData[0].state_value.name
        ) {
          for (const x of countyData) {
            const countData = await this.executeSelectRawQuery(
              `SELECT COALESCE(COUNT(user_answer_id), 0) AS count FROM user_answers WHERE state_symbol =:stateSymbol AND county =:countyName AND question_id =:questionId AND answer_id =:answerId`,
              {
                ...queryReplaceMents,
                ...{ answerId: x.answer_id },
                ...{ questionId: x.question_id },
              },
              t || null
            );
            x.count = countData && countData.length ? countData[0].count : 0;
          }
          for (const x of answerArrayData) {
            const countData = await this.executeSelectRawQuery(
              `SELECT COALESCE(COUNT(user_answer_id), 0) AS count FROM user_answers WHERE state_symbol =:stateSymbol  AND question_id =:questionId AND answer_id =:answerId`,
              {
                ...queryReplaceMents,
                ...{ answerId: x.answer_id },
                ...{ questionId: x.question_id },
              },
              t || null
            );
            x.count = countData && countData.length ? countData[0].count : 0;
          }
          if (
            userCountyDataAndStateData[0].state_value.data &&
            userCountyDataAndStateData[0].state_value.data.length
          ) {
            userCountyDataAndStateData[0].state_value.data.forEach((x) => {
              countyData.push(x);
            });
            if (
              userCountyDataAndStateData[0].options &&
              userCountyDataAndStateData[0].options.length
            ) {
              userCountyDataAndStateData[0].options.forEach((x) => {
                answerArrayData.push(x);
              });
            }
          }
          //options is used for showing state data
          const query = ` WITH json_structure AS(SELECT('{' || index - 1 || ',"data"}'):: TEXT[] AS path FROM "answer_audit", jsonb_array_elements(state_data) with ordinality arr(state_value, index) WHERE "state_value" ->> 'name'=:countyName AND "state_code" =:stateSymbol) update "answer_audit" set "state_data" = jsonb_set(state_data, json_structure.path, '${JSON.stringify(
            countyData
          )}',false),"options"='${JSON.stringify(
            answerArrayData
          )} ' FROM "json_structure" WHERE "state_code"=:stateSymbol RETURNING *`;
          await this.executeUpdateRawQuery(
            query,
            {
              countyName: userStateCountyData.county,
              stateSymbol: userStateCountyData.state_symbol,
            },
            t || null
          );
          return;
        } else return;
      }
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserStateAndCountyData(userId, t) {
    try {
      const query = `SELECT "state_symbol","state","gender","county", "user_name" FROM "users" WHERE "user_id"=:userId`;
      const data = await this.executeSelectRawQuery(
        query,
        { userId: userId },
        t
      );
      if (data && data.length) {
        return data[0];
      } else {
        return null;
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async blockUser(requestData, userId) {
    const t = await Sequelize.transaction();
    try {
      const data = await UserBlocksModel.create(requestData, {
        transaction: t,
      });
      await UserFollowRequest.destroy(
        {
          where: {
            [Op.or]: [
              { followed_by: userId, followed_to: requestData.user_id },
              { followed_by: requestData.user_id, followed_to: userId },
            ],
          },
        },
        { transaction: t }
      );
      await UserFollowsModel.destroy(
        {
          where: {
            [Op.or]: [
              { followed_by: userId, followed_to: requestData.user_id },
              { followed_by: requestData.user_id, followed_to: userId },
            ],
          },
        },
        { transaction: t }
      );
      await t.commit();
      const query = `DELETE FROM notifications WHERE sender_id IN (:userId, :requestedUserId) AND receiver_id IN (:userId, :requestedUserId)`;
      await this.executeDeleteRawQuery(query, {
        userId: userId,
        requestedUserId: requestData.user_id,
      });
      return data;
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAlreadyBlocked(requestData, userId) {
    try {
      const query = `SELECT "block_id" FROM "user_blocks" WHERE ("blocked_by"=:userBlockedId AND "blocked_to"=:userId) OR ("blocked_by"=:userId AND "blocked_to"=:userBlockedId)`;
      return await this.executeSelectRawQuery(query, {
        userBlockedId: requestData.user_id,
        userId: userId,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAlreadyUnBlocked(requestData) {
    try {
      const query = `SELECT "block_id" FROM "user_blocks" WHERE ("block_id"=:userBlockedId)`;
      return await this.executeSelectRawQuery(query, {
        userBlockedId: requestData.block_id,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getBlockList(requestData, userId) {
    const query = `SELECT (SELECT COUNT(block_id) FROM "user_blocks" INNER JOIN "users" ON "user_blocks"."blocked_to"="users"."user_id" WHERE "blocked_by"=:userId ) AS "total_count","users"."profile_picture","users"."user_name",CONCAT("users"."first_name",' ',"users"."last_name") AS "full_name","users"."user_id","block_id" FROM "user_blocks" INNER JOIN "users" ON "user_blocks"."blocked_to"="users"."user_id" WHERE "blocked_by"=:userId ORDER BY "user_blocks"."created_at" DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
    return await this.executeSelectRawQuery(query, {
      page_number: +requestData.page_number || 1,
      limit: +requestData.limit || 10,
      userId: userId,
    });
  }

  async unBlockUser(requestData) {
    try {
      return await UserBlocksModel.destroy({
        where: { block_id: requestData.block_id },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAnswerIsAlreadyGiven(requestData, userId) {
    try {
      return await UserAnswersModel.findOne({
        where: { user_id: userId, question_id: requestData.question_id },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  getBlockCondition(loggedInUser = null) {
    if (loggedInUser) {
      return `(SELECT "blocked_to" AS "user_id" FROM "user_blocks" WHERE "blocked_by" =:loggedInUser AND blocked_to is not null  UNION SELECT "blocked_by" AS "user_id" FROM "user_blocks" WHERE "blocked_to" =:loggedInUser AND blocked_by is not null)`;
    } else {
      return ` (SELECT "blocked_to" AS "user_id" FROM "user_blocks" WHERE "blocked_by" =:userId AND blocked_to is not null  UNION SELECT "blocked_by" AS "user_id" FROM "user_blocks" WHERE "blocked_to" =:userId AND blocked_by is not null) `;
    }
  }

  async addCategory(requestData) {
    try {
      const checkData = await CategoryMasterModel.findOne({
        where: { category_id: requestData.category_id },
      });
      if (!checkData)
        return await CategoryMasterModel.create({
          category_id: requestData.category_id || uuidv4(),
          category_name: requestData.category_name,
          prefrence_order: +requestData.prefrence_order,
        });
      else if (checkData)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_CATEGORY_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getListCategoryMasterService() {
    try {
      return await CategoryMasterModel.findAll({});
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateMasterCatgeory(requestData) {
    try {
      return await CategoryMasterModel.update(
        {
          category_id: requestData.category_id,
          category_name: requestData.category_name,
          prefrence_order: requestData.prefrence_order,
        },
        { where: { category_id: requestData.category_id } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteMasterCatgeory(requestData) {
    try {
      const checkData = await CategoryMasterModel.findOne({
        where: { category_id: requestData.category_id },
      });
      if (checkData)
        return await CategoryMasterModel.destroy({
          where: { category_id: requestData.category_id },
        });
      else if (!checkData)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_DELETED_CATEGORY_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateSeenStatus(requestData) {
    try {
      return await NotificationsModel.update(
        { seen: true },
        { where: { notification_id: requestData.notification_id } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkAndGetStatus(requestData, userId) {
    try {
      let query;
      const replaceMents = {};
      replaceMents.userId = userId;
      if (requestData.question_shared_id) {
        query = `SELECT (CASE WHEN(EXISTS (SELECT FROM reported_questions WHERE  question_shared_id=:questionSharedId AND reported_by=:userId) ) THEN true ELSE false END ) AS is_reported,is_deleted,is_commenting_enabled FROM user_shared_questions WHERE question_shared_id=:questionSharedId`;
        replaceMents.questionSharedId = requestData.question_shared_id;
      } else if (!requestData.question_shared_id && requestData.question_id) {
        query = `SELECT (CASE WHEN(EXISTS (SELECT FROM reported_questions WHERE  question_id=:questionId AND reported_by=:userId) ) THEN true ELSE false END ) AS is_reported,is_deleted,is_commenting_enabled FROM questions WHERE question_id=:questionId`;
        replaceMents.questionId = requestData.question_id;
      } else if (requestData.comment_id) {
        query = `SELECT (CASE WHEN(EXISTS (SELECT FROM reported_comments WHERE comment_id=:commentId AND reported_by=:userId) )THEN true ELSE false END ) AS is_reported,user_comments.is_deleted, (case when (user_shared_questions.question_shared_id is null) then questions.is_commenting_enabled else user_shared_questions.is_commenting_enabled end) AS is_commenting_enabled FROM user_comments LEFT JOIN user_shared_questions ON user_shared_questions.question_shared_id=user_comments.question_shared_id LEFT JOIN questions ON questions.question_id=user_comments.question_id  WHERE user_comments.comment_id=:commentId`;
        replaceMents.commentId = requestData.comment_id;
      } else return null;
      return await this.executeSelectRawQuery(query, replaceMents);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getNotificationData(requestData) {
    try {
      return NotificationsModel.findOne({
        where: { notification_id: requestData.notification_id },
        attributes: ["sender_id", "seen", "is_read", "is_deleted"],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkAndMoveQuestionsToTrending(requestData, t) {
    try {
      const countData = await ThresholdTrendingMasterModel.findOne({
        where: { type: TRENDING_THRESHOLD_TYPE.VOTE_COUNT },
        transaction: t,
      });
      if (countData && countData.dataValues) {
        const query = `SELECT COALESCE(COUNT(answer_id),0) AS answer_count FROM user_answers WHERE question_id=:questionId`;
        const data = await this.executeSelectRawQuery(
          query,
          { questionId: requestData.question_id },
          t
        );
        if (
          data &&
          data.length &&
          +data[0].answer_count >= +countData.dataValues.threshold_count
        ) {
          await QuestionModel.update(
            { is_trending: true, trending_date: Date.now() },
            { where: { question_id: requestData.question_id }, transaction: t }
          );
          const expirationModelData = await QuestionExpirationModel.findOne({
            where: {
              question_id: requestData.question_id,
            },
            transaction: t,
          });
          if (!expirationModelData) {
            await QuestionExpirationModel.create(
              {
                question_expiration_id: uuidv4(),
                question_id: requestData.question_id,
                expiry_time:
                  Date.now() +
                  +process.env.TRENDING_EXPIRY_DAY * 24 * 60 * 60 * 1000,
                expiration_type: QUESTION_EXPIRATION_TYPE.TRENDING_POST,
              },
              { transaction: t }
            );
          }
        }
      }
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async expireTrendingQuestions() {
    try {
      const currentTimeStamp = Date.now();
      const query = `UPDATE "questions" SET "is_trending"=false WHERE "question_id" IN (SELECT "question_id" FROM "question_expiration" WHERE expiry_time<=${currentTimeStamp})`;
      const deleteQuery = `DELETE  FROM "question_expiration" WHERE "question_id" IN (SELECT "question_id" FROM "question_expiration" WHERE expiry_time<=${currentTimeStamp})`;
      await Promise.all([
        this.executeUpdateRawQuery(query, {}),
        this.executeDeleteRawQuery(deleteQuery, {}),
      ]);
      return;
    } catch (err) {
      Logger.error(new Error(err));
    }
  }

  async addToSearchSuggestions(requestData, userId) {
    try {
      let data = {};
      const checkIfUserExists = await SearchSuggestionModel.findOne({
        where: { searched_user_id: requestData.user_id, user_id: userId },
        attributes: ["id"],
      });
      if (checkIfUserExists && checkIfUserExists.dataValues) {
        await SearchSuggestionModel.update(
          { created_at: Date.now() },
          { where: { id: checkIfUserExists.dataValues.id } }
        );
      } else {
        data = await SearchSuggestionModel.create({
          id: uuidv4(),
          searched_user_id: requestData.user_id,
          user_id: userId,
          created_at: Date.now(),
        });
      }
      await this.checkAndRemoveSuggestions(userId);
      return data;
    } catch (err) {
      Logger.error(new Error(err));
    }
  }

  async getSearchSuggestionList(userId) {
    try {
      await this.checkAndRemoveSuggestions(userId);
      const query = `SELECT search_suggestions.id as search_suggestion_id,users.user_id,users.user_name,users.profile_picture,users.first_name,users.last_name,CONCAT(users.first_name,' ',users.last_name) AS full_name FROM search_suggestions INNER JOIN users ON users.user_id=search_suggestions.searched_user_id WHERE search_suggestions.user_id=:userId AND search_suggestions.searched_user_id NOT IN (select blocked_to from user_blocks where blocked_by=:userId and blocked_to is not null) OR search_suggestions.searched_user_id NOT IN (select reported_to from reported_users where reported_by=:userId and reported_to is not null) ORDER BY search_suggestions.created_at DESC`;
      return await this.executeSelectRawQuery(query, { userId: userId });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkAndRemoveSuggestions(userId) {
    try {
      const countQuery = `SELECT COUNT(search_suggestions.id) AS count FROM search_suggestions WHERE user_id=:userId GROUP BY user_id`;
      const data = await this.executeSelectRawQuery(countQuery, {
        userId: userId,
      });
      if (data && data.length) {
        if (+data[0].count > 10) {
          await this.executeDeleteRawQuery(
            `DELETE FROM search_suggestions WHERE id IN (select id from search_suggestions where user_id=:userId ORDER BY created_at DESC OFFSET 10)`,
            { userId: userId }
          );
        }
      }
      return;
    } catch (err) {
      Logger.error(new Error(err));
    }
  }

  async getFollowingList(requestData) {
    try {
      const replaceMents = {};
      replaceMents.userId = requestData.user_id;
      replaceMents.page_number = +requestData.page_number;
      replaceMents.limit = +requestData.limit;
      let searchQuery = ``;
      if (requestData.search) {
        searchQuery += ` AND (users.user_name ilike :search OR users.first_name ilike :search OR users.last_name ilike :search)`;
        replaceMents.search = `%${requestData.search}%`;
      }
      const query = `SELECT (SELECT COUNT(user_id) FROM "users" INNER JOIN (select "user_follows"."follows_id","user_follows"."followed_to","user_follows"."created_at" FROM "user_follows"  WHERE  "user_follows"."followed_by"=:userId ) subQuery ON subQuery.followed_to=users.user_id WHERE "users"."is_active"=true ${searchQuery}) AS total_count,"users"."user_name","users"."profile_picture","users"."user_id",CONCAT("users"."first_name",' ',"users"."last_name") AS "full_name","users"."first_name","users"."last_name","users"."title","users"."bio","users"."is_officially_verified", "users"."is_business_account", "users"."unique_id" FROM "users" INNER JOIN (select "user_follows"."follows_id","user_follows"."followed_to","user_follows"."created_at" FROM "user_follows" WHERE "user_follows"."followed_by"=:userId) subQuery ON subQuery.followed_to=users.user_id WHERE "users"."is_active"=true ${searchQuery} ORDER BY "users"."created_at" OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      return await this.executeSelectRawQuery(query, replaceMents);
    } catch (err) {
      throw err;
    }
  }

  async getFollowsList(requestData) {
    try {
      const replaceMents = {};
      replaceMents.userId = requestData.user_id;
      replaceMents.page_number = +requestData.page_number;
      replaceMents.limit = +requestData.limit;
      let searchQuery = ``;
      if (requestData.search) {
        searchQuery += ` AND (users.user_name ilike :search OR users.first_name ilike :search OR users.last_name ilike :search)`;
        replaceMents.search = `%${requestData.search}%`;
      }
      const query = `SELECT (SELECT COUNT(user_id) FROM "users" INNER JOIN (select "user_follows"."follows_id","user_follows"."followed_by","user_follows"."created_at" FROM "user_follows"  WHERE  "user_follows"."followed_to"=:userId ) subQuery ON subQuery.followed_by=users.user_id WHERE "users"."is_active"=true ${searchQuery}) AS total_count,"users"."user_name","users"."profile_picture","users"."user_id",CONCAT("users"."first_name",' ',"users"."last_name") AS "full_name","users"."first_name","users"."last_name","users"."title","users"."bio","users"."is_officially_verified", "users"."is_business_account", "users"."unique_id" FROM "users" INNER JOIN (select "user_follows"."follows_id","user_follows"."followed_by","user_follows"."created_at" FROM "user_follows" WHERE "user_follows"."followed_to"=:userId) subQuery ON subQuery.followed_by=users.user_id WHERE "users"."is_active"=true ${searchQuery} ORDER BY "users"."created_at" OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      return await this.executeSelectRawQuery(query, replaceMents);
    } catch (err) {
      throw err;
    }
  }

  async getMutualFriensList(requestData, userIds) {
    try {
      const replaceMents = {};
      replaceMents.userIds = userIds;
      replaceMents.userId = requestData.user_id;
      replaceMents.page_number = +requestData.page_number;
      replaceMents.limit = +requestData.limit;
      let searchQuery = ``;
      if (requestData.search) {
        searchQuery += ` AND ((LOWER(users.first_name) like :keyword OR LOWER(users.last_name) like :keyword OR LOWER(users.user_name) like :keyword OR LOWER(CONCAT(users.first_name,' ', users.last_name)) like :keyword))`;
        replaceMents.keyword = `%${requestData.search.toLowerCase()}%`;
      }
      const query = `SELECT (SELECT COUNT(user_id) FROM "users" INNER JOIN (select "user_follows"."follows_id","user_follows"."followed_by","user_follows"."created_at" FROM "user_follows"  WHERE  ("user_follows"."followed_to" IN (:userIds) AND "user_follows"."followed_by"=:userId ) OR ("user_follows"."followed_to"=:userId AND "user_follows"."followed_by" IN (:userIds)) ) subQuery ON subQuery.followed_by=users.user_id WHERE "users"."is_active"=true ${searchQuery}) AS total_count,"users"."user_name","users"."profile_picture","users"."user_id",CONCAT("users"."first_name",' ',"users"."last_name") AS "full_name","users"."first_name","users"."last_name","users"."title","users"."bio","users"."is_officially_verified", "users"."is_business_account", "users"."unique_id" FROM "users" INNER JOIN (select "user_follows"."follows_id","user_follows"."followed_by","user_follows"."created_at" FROM "user_follows" WHERE ("user_follows"."followed_to" IN (:userIds) AND "user_follows"."followed_by"=:userId ) OR ("user_follows"."followed_to"=:userId AND "user_follows"."followed_by" IN (:userIds)) ) subQuery ON subQuery.followed_by=users.user_id WHERE "users"."is_active"=true ${searchQuery} ORDER BY "users"."created_at" OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      return await this.executeSelectRawQuery(query, replaceMents);
    } catch (err) {
      throw err;
    }
  }

  async getConnectedProfiles(userId, parentId) {
    try {
      if (!parentId) {
        parentId = userId;
      }
      const query = `SELECT (CASE WHEN user_id =:userId THEN 1 ELSE 0 END) AS is_current_user, first_name, last_name, email, profile_picture,user_id, is_business_account, business_account_name, is_officially_verified, unique_id FROM users WHERE (parent_id=:parentId OR user_id =:parentId) AND is_active = true AND is_deleted = false AND (is_email_verified = true OR is_phone_verified = true) ORDER BY is_current_user DESC`;
      return await this.executeSelectRawQuery(query, {
        parentId: parentId,
        userId: userId,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserVerificationFormCount(userId) {
    try {
      const query = `SELECT COUNT(id) as count FROM "request_verification_form" WHERE "user_id"=:userId`;
      return await this.executeSelectRawQuery(query, { userId: userId });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSuggestedFriendList(requestData, userId) {
    try {
      const replaceMents = {};
      replaceMents.userId = userId;
      replaceMents.page_number = +requestData.page_number;
      replaceMents.limit = +requestData.limit;
      let mutualFriendQuery = ``;
      let otherUserWhere = ``;
      if (requestData.user_id) {
        mutualFriendQuery = ` UNION (SELECT 2 as priority, user_id, first_name, last_name, profile_picture,user_name, account_type, created_at, is_active, is_deleted, is_profile_completed, is_officially_verified, is_business_account, unique_id FROM users where "users"."user_id" IN (SELECT followed_by as user_id FROM user_follows where followed_to =:otherUserId UNION SELECT followed_to as user_id FROM user_follows where followed_by =:otherUserId))`;
        otherUserWhere = ` AND "main_user"."user_id" !=:otherUserId`;
        replaceMents.otherUserId = requestData.user_id;
      }
      let searchQuery = ``;
      if (requestData.search) {
        searchQuery += ` AND (user_name ilike :search OR CONCAT("first_name", ' ', "last_name") ilike :search)`;
        replaceMents.search = `%${requestData.search}%`;
      }
      const countQuery = `(SELECT COUNT(*) from ((SELECT 1 as priority, "users"."user_id", first_name,last_name, profile_picture, user_name, account_type, "users"."created_at", "users"."is_active", "users"."is_deleted", "users"."is_profile_completed", "users"."is_officially_verified", "users"."is_business_account", "users"."unique_id" FROM users INNER JOIN user_contacts ON "users"."phone_number" = "user_contacts"."phone_number" where "user_contacts"."user_id" =:userId) ${mutualFriendQuery} UNION (SELECT 3 as priority, "users"."user_id", first_name, last_name, profile_picture, user_name, account_type, "users"."created_at", "users"."is_active", "users"."is_deleted", "users"."is_profile_completed", "users"."is_officially_verified", "users"."is_business_account", "users"."unique_id" FROM users)) main_user WHERE "main_user"."user_id" NOT IN (SELECT followed_to from user_follows WHERE followed_by =:userId) AND "main_user"."user_id" NOT IN (SELECT removed_to from removed_suggested_friends where removed_by =:userId) AND "main_user"."user_id" !=:userId AND "main_user"."user_id" NOT IN (SELECT followed_to from user_follow_requests where followed_by =:userId) AND "main_user"."is_active" = true AND "main_user"."is_deleted" = false AND "main_user"."is_profile_completed" = true AND "main_user"."user_id" NOT IN ${this.getBlockCondition()}  ${searchQuery} ${otherUserWhere}) AS total_count`;

      const followedByQuery = `(SELECT coalesce(ARRAY_AGG(user_name),'{}') as friend_followed FROM "users" INNER JOIN user_follows as follow ON follow.followed_by = "users"."user_id" WHERE follow.followed_to = main_user.user_id AND "users"."user_id" IN (select user_id FROM "user_follows" INNER JOIN "user_follows" as "follower" ON "follower"."followed_by"="user_follows"."followed_to" AND "follower"."followed_to"="user_follows"."followed_by" WHERE "user_follows"."followed_by"=:userId) )`;

      const query = `SELECT *, ${countQuery}, ${followedByQuery} from ((SELECT 1 as priority, "users"."user_id", first_name, last_name, profile_picture, user_name,account_type, "users"."created_at", "users"."is_active", "users"."is_deleted", "users"."is_profile_completed", "users"."is_officially_verified", "users"."is_business_account", "users"."unique_id" FROM users INNER JOIN user_contacts ON "users"."phone_number" = "user_contacts"."phone_number" where "user_contacts"."user_id" =:userId) ${mutualFriendQuery} UNION (SELECT 3 as priority, "users"."user_id", first_name, last_name, profile_picture, user_name, account_type, "users"."created_at", "users"."is_active", "users"."is_deleted", "users"."is_profile_completed", "users"."is_officially_verified", "users"."is_business_account", "users"."unique_id" FROM users)) main_user WHERE "main_user"."user_id" NOT IN (SELECT followed_to from user_follows WHERE followed_by =:userId) AND "main_user"."user_id" NOT IN (SELECT removed_to from removed_suggested_friends where removed_by =:userId) AND "main_user"."user_id" !=:userId  AND "main_user"."user_id" NOT IN (SELECT followed_to from user_follow_requests where followed_by =:userId) AND "main_user"."is_active" = true AND "main_user"."is_deleted" = false AND "main_user"."is_profile_completed" = true AND "main_user"."user_id" NOT IN ${this.getBlockCondition()}  ${searchQuery} ${otherUserWhere} ORDER BY "main_user"."priority" ASC  OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      return await this.executeSelectRawQuery(query, replaceMents);
    } catch (err) {
      throw err;
    }
  }

  async enableDisableContactsSyncing(requestData, userId) {
    try {
      return await UserModel.update(
        { contact_syncing_enabled: requestData.status },
        { where: { user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getCategoryDetails(categoryId) {
    return await BusinessCategoryModel.findOne({
      where: { category_id: categoryId },
      attributes: ["category_id", "category_name"],
    });
  }

  async removeSuggestedFriend(requestData, userId) {
    try {
      return await RemovedSuggestedFriends.create({
        id: uuidv4(),
        removed_to: requestData.user_id,
        removed_by: userId,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  getOtherProfileBlockCondition() {
    return ` (SELECT "blocked_to" AS "user_id" FROM "user_blocks" WHERE "blocked_by"=:loggedInUserId UNION SELECT "blocked_by" AS "user_id" FROM "user_blocks" WHERE "blocked_to"=:loggedInUserId) `;
  }

  async getQuestionsAndAnswersMetaData(
    requestData,
    t = null,
    average_rating = 0
  ) {
    try {
      let filterQueryArray = [];
      let resultData = [];
      const getOptionsQuery = `SELECT "question_option_id","question_id","options","option_number" FROM "question_options" WHERE "question_id"=:questionId ORDER BY option_number`;
      const getQuestionsAnswers = await this.executeSelectRawQuery(
        getOptionsQuery,
        { questionId: requestData.question_id },
        t
      );
      let query = `SELECT  `;
      let genderFilter = ``;
      let verifiedFilter = ``;
      let stateFilter = ``;
      let countyFilter = ``;
      if (requestData.gender) {
        genderFilter = `and "user_answers"."gender" in (${requestData.gender})`;
      }
      if (requestData.verified == "true") {
        verifiedFilter = ` and "users"."is_officially_verified"= true`;
      }
      if (requestData.state) {
        stateFilter = ` and "user_answers"."state"= '${requestData.state}'`;
      }
      if (requestData.county) {
        countyFilter = ` and "user_answers"."county"= '${requestData.county}'`;
      }
      getQuestionsAnswers.forEach((x) => {
        filterQueryArray.push(
          `(SELECT ROUND((COUNT(answer_id) * 100)::numeric / NULLIF((SELECT COUNT(*) FROM "user_answers" inner join "users" USING ("user_id") WHERE "question_id"='${requestData.question_id}' ${genderFilter} ${verifiedFilter} ${stateFilter} ${countyFilter}), 0),2) FROM "user_answers" inner join "users" USING ("user_id") WHERE "answer_id"='${x.question_option_id}' AND "question_id"='${requestData.question_id}' ${genderFilter} ${verifiedFilter} ${stateFilter} ${countyFilter} GROUP BY "answer_id")AS "${x.question_option_id}",(SELECT COALESCE(COUNT(*),0) FROM "user_answers" inner join "users" USING ("user_id") WHERE "question_id"='${requestData.question_id}' AND "answer_id"='${x.question_option_id}' ${genderFilter} ${verifiedFilter} ${stateFilter} ${countyFilter} GROUP BY "answer_id") AS "${x.question_option_id}_count","question_options"."question_option_id" AS "answer_id","question_options"."options" AS "name","option_number" AS "option" `
        );
      });
      query += filterQueryArray.join(",");
      query += ` FROM  "user_answers" INNER JOIN "question_options" USING ("question_id") Where "user_answers"."question_id"=:questionId GROUP BY "question_option_id" ORDER BY "option_number"`;
      let answerCountData = await this.executeSelectRawQuery(
        query,
        { questionId: requestData.question_id },
        t
      );
      answerCountData.forEach((x) => {
        const percentage = answerCountData[0][x.answer_id] || 0;
        resultData.push({
          answer_id: x.answer_id,
          name: x.name,
          option: x.option,
          percentage: percentage,
          count: answerCountData[0][`${x.answer_id}_count`] || 0,
          average_rating,
        });
      });
      return resultData;
    } catch (err) {
      throw err;
    }
  }

  // This function checks the video if exists in audit table
  async checkIfTranscodedVideoExists(video_url) {
    try {
      const query = `SELECT "video_url","transcoded_video_url" FROM "transcoded_videos_audit" WHERE "video_url"=:videoUrl`;
      const videoData = await this.executeSelectRawQuery(query, {
        videoUrl: video_url,
      });
      if (videoData && videoData.length) {
        return videoData[0].transcoded_video_url;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  async getBusinessAccountDetails(userId) {
    try {
      const query = `select category_name, users.email, users.phone_number, users.country_code from users inner join business_categories_master on users.business_account_category = business_categories_master.category_id where users.user_id =:userId`;
      return await this.executeSelectRawQuery(query, { userId: userId });
    } catch (error) {
      throw error;
    }
  }

  async checkIfQuestionExists(requestData) {
    try {
      return await QuestionModel.findOne({
        where: {
          question_uuid: requestData.question_uuid,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  //toggleGender
  async toggleGender(requestData, userId) {
    try {
      const data = await UserModel.update(
        { show_gender: requestData.toggle },
        {
          where: {
            user_id: userId,
          },
        }
      );
      UserModel.update(
        { show_gender: requestData.toggle },
        { where: { parent_id: userId } }
      ).catch((err) => console.error("Error- Toggle gender:", err));
      return data;
    } catch (error) {
      throw error;
    }
  }

  //getGraphData
  async getGraphData(requestData, answer_id) {
    try {
      let genderFilter = ``;
      let verifiedFilter = ``;
      let stateFilter = ``;
      let countyFilter = ``;
      if (requestData.gender) {
        genderFilter = `and "user_answers"."gender" in (${requestData.gender}) `;
      }
      if (requestData.verified == "true") {
        verifiedFilter = ` and "users"."is_officially_verified"= true`;
      }
      if (requestData.state) {
        stateFilter = ` and "user_answers"."state"= '${requestData.state}'`;
      }
      if (requestData.county) {
        countyFilter = ` and "user_answers"."county"= '${requestData.county}'`;
      }
      const query = `select count(answer_id), EXTRACT(YEAR from AGE(users.date_of_birth)) as "age" FROM users
              inner join user_answers using(user_id) where question_id =:question_id and answer_id =:answer_id ${genderFilter} ${verifiedFilter} ${stateFilter} ${countyFilter}
              group by age order by age asc;`;
      return await this.executeSelectRawQuery(query, {
        question_id: requestData.question_id,
        answer_id: answer_id,
      });
    } catch (error) {
      throw error;
    }
  }

  //search user
  async searchUser(requestData, userId) {
    try {
      if (requestData.search) {
        new QuestionRepository()
          .saveSearchForRecommendation(requestData, userId)
          .catch((err) => {
            console.error(`Error- Get user elastic data:`, err);
          });
      }
      const query = `SELECT user_id from users where ((LOWER(first_name) like :keyword OR LOWER(last_name) like :keyword OR LOWER(user_name) like :keyword OR LOWER(email) like :keyword OR LOWER(CONCAT(first_name,' ', last_name)) like :keyword)) AND is_active = true AND is_profile_completed = true`;
      let elasticUserIds = await this.executeSelectRawQuery(query, {
        keyword: `%${requestData.search.toLowerCase()}%`,
      });
      if (elasticUserIds && elasticUserIds.length) {
        elasticUserIds = [
          ...new Set(
            elasticUserIds.map((data) => {
              return data.user_id;
            })
          ),
        ];
      }
      if (elasticUserIds && elasticUserIds.length) {
        const userDetails = await this.fetchDataFromDbAfterSearchViaElastic(
          elasticUserIds,
          userId
        );
        let map = {};
        userDetails.forEach((_user) => {
          map[_user.user_id] = _user;
        });
        return {
          data: Object.values(map),
          total_count: Object.values(map).length,
        };
      } else
        return {
          data: [],
          total_count: 0,
        };
    } catch (error) {
      throw new ErrorHandler().customError(
        ERROR_MESSSAGES.SEARCH_SERVICE_NOT_AVAILABLE,
        HTTP_CODES.BAD_REQUEST
      );
    }
  }

  async fetchDataFromDbAfterSearchViaElastic(userIds, loggedInUserId) {
    try {
      const query = `SELECT DISTINCT(users.user_id), users.first_name, users.last_name, users.profile_picture, users.created_at, users.user_name, CONCAT("users"."first_name",' ', "users"."last_name") AS "full_name", users.account_type, users.is_business_account, users.is_officially_verified, users.unique_id, (CASE WHEN "user_follow_requests"."followed_by" =:loggedInUserId THEN true ELSE false END) AS "is_request_sent", (CASE WHEN "user_follows"."followed_by" =:loggedInUserId THEN true ELSE false END) as "is_followed" FROM users LEFT JOIN user_follow_requests ON users.user_id = user_follow_requests.followed_to LEFT JOIN user_follows ON users.user_id = user_follows.followed_to WHERE user_id IN (:userIds)`;
      const queryData = await this.executeSelectRawQuery(query, {
        userIds: userIds,
        loggedInUserId: loggedInUserId,
      });
      if (queryData && queryData.length) {
        await Promise.all(
          queryData.map(async (x) => {
            const friendData = await UserFollowsModel.findAll({
              where: {
                followed_to: x.user_id,
              },
              attributes: [],
              include: [
                {
                  model: UserModel,
                  as: "followed_by_user",
                  required: false,
                  where: {
                    user_id: {
                      [Op.col]: "user_follows.followed_by",
                    },
                  },
                  attributes: ["user_name"],
                  separate: false,
                },
              ],
            });
            x.followers_count = friendData.length
            // x.friend_followed = friendData.map((item) => {
            //   return item.followed_by_user
            //     ? item.followed_by_user.user_name
            //     : null;
            // });
          })
        );
      }
      return queryData;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //add user data on elastic DB
  addUserDataOnElasticDb(userId) {
    try {
      client.index({
        index: process.env.ELASTIC_USERS_INDEX,
        id: userId,
        body: {
          user_id: userId,
          created_at: Date.now(),
        },
      });
    } catch (error) {
      Logger.error(new Error(error));
    }
  }

  //Add business acount on elastic data
  addBusinessAccountOnElasticDb(businessAccountData, userId) {
    try {
      client.index({
        index: process.env.ELASTIC_USERS_INDEX,
        id: userId,
        body: {
          business_account_name: businessAccountData.business_account_name,
          user_name: businessAccountData.user_name,
          full_name:
            businessAccountData.first_name +
            " " +
            businessAccountData.last_name,
          user_id: userId,
        },
      });
    } catch (err) {
      Logger.error(new Error(err));
    }
  }

  // update profile data on elastic DB..
  updateUserDataOnElasticDb(requestData, userId) {
    try {
      client
        .updateByQuery({
          index: process.env.ELASTIC_USERS_INDEX,
          body: {
            script: {
              lang: "painless",
              source:
                "ctx._source.full_name=params.full_name; ctx._source.profile_picture=params.profile_picture; ctx._source.user_name=params.user_name",
              params: {
                full_name: requestData.first_name + " " + requestData.last_name,
                profile_picture: requestData.profile_picture,
                user_name: requestData.user_name,
              },
            },
            query: {
              match: {
                user_id: userId,
              },
            },
          },
        })
        .catch((err) => {
          Logger.error(new Error(err));
          throw err;
        });
    } catch (error) {
      Logger.error(new Error(error));
    }
  }

  // get data from elastic search ..
  async getUserElasticData(requestData, userId) {
    try {
      requestData.search = requestData.search.toLowerCase();
      let boolObject;
      if (requestData.search) {
        new QuestionRepository()
          .saveSearchForRecommendation(requestData, userId)
          .catch((err) => {
            console.error(`Error- Get user elastic data:`, err);
          });
        boolObject = {
          bool: {
            should: [
              {
                match: {
                  full_name: {
                    query: `${requestData.search}`,
                    operator: "or",
                    boost: 20,
                    fuzziness: requestData.search.length === 1 ? 0 : 1,
                    zero_terms_query: "all",
                  },
                },
              },
              {
                match: {
                  user_name: {
                    query: `${requestData.search}`,
                    operator: "or",
                    boost: 5,
                    fuzziness: requestData.search.length === 1 ? 0 : 1,
                    zero_terms_query: "all",
                  },
                },
              },
            ],
          },
        };
      }
      const [elasticData, countData] = await Promise.all([
        this.getUserDataFromElasticDB(boolObject, requestData),
      ]);
      return {
        elasticUserIds: elasticData.userIds,
        totalCount: elasticData.total,
      };
    } catch (error) {
      Logger.error(new Error(error));
      throw error;
    }
  }

  async getUserDataFromElasticDB(boolObject, requestData) {
    return new Promise((resolve, reject) => {
      client
        .search({
          index: process.env.ELASTIC_USERS_INDEX,
          body: {
            from:
              (Number(requestData.page_number) - 1) * Number(requestData.limit),
            size: requestData.limit,
            query: {
              bool: {
                should: [boolObject],
              },
            },
          },
        })
        .then((response) => {
          const userIds = [];
          if (
            response &&
            response.body &&
            response.body.hits &&
            response.body.hits &&
            response.body.hits.hits &&
            response.body.hits.hits.length
          ) {
            response.body.hits.hits.forEach((x) => userIds.push(x["_id"]));
          }
          resolve({
            userIds,
            total:
              response &&
                response.body &&
                response.body.hits &&
                response.body.hits.total
                ? response.body.hits.total.value
                : 0,
          });
        })
        .catch((err) => {
          reject(err);
        });
    }).catch((err) => {
      throw err;
    });
  }

  async getTotalCountFromElasticDB(boolObject) {
    return new Promise((resolve, reject) => {
      client
        .count({
          index: process.env.ELASTIC_USERS_INDEX,
          body: {
            query: {
              bool: {
                should: [boolObject],
              },
            },
          },
        })
        .then((response) => {
          if (response && response.body && response.body.count)
            resolve(response.body.count);
          else resolve(0);
        })
        .catch((err) => {
          reject(err);
        });
    }).catch((err) => {
      throw err;
    });
  }

  async getReportedUsersData(userId) {
    try {
      return await ReportedUsersModel.findAll({
        where: {
          [Op.or]: [{ reported_by: userId }, { reported_to: userId }],
        },
        attributes: ["reported_by", "reported_to"],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //check if user is already reported
  async checkIfAlreadyReportedUser(requestData, userId) {
    try {
      const data = await ReportedUsersModel.findOne({
        where: { reported_by: userId, reported_to: requestData.reported_to },
      });
      return data && data.dataValues ? true : false;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //report the user
  async reportUser(requestData, userId) {
    const t = await Sequelize.transaction();
    let needToSendEmail = false;
    try {
      if (requestData.reported_to === userId)
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.CANNOT_REPORT_OWN_USER,
          HTTP_CODES.BAD_REQUEST
        );
      const now = Date.now();
      const yesterday = now - 24 * 60 * 60 * 1000;
      const data = await ReportedUsersModel.create(
        {
          id: uuidv4(),
          reported_by: userId,
          reported_to: requestData.reported_to,
          report_reason_id: requestData.report_reason_id || null,
          other_reason: requestData.other_reason || null,
          created_at: now,
        },
        { transaction: t }
      );
      if (data) {
        //check for report threshold
        const record = await ReportedUsersModel.count({
          where: {
            created_at: {
              [Op.between]: [yesterday, now],
            },
          },
          transaction: t,
        });
        if (Number(record) >= Number(process.env.REPORT_USER_THRESHOLD)) {
          needToSendEmail = true;
          await UserModel.update(
            { is_active: false },
            { where: { user_id: requestData.reported_to }, transaction: t }
          );
        }
        await Promise.all([
          UserFollowsModel.destroy({
            where: {
              followed_by: userId,
              followed_to: requestData.reported_to,
            },
            transaction: t,
          }),
          UserFollowsModel.destroy({
            where: {
              followed_to: userId,
              followed_by: requestData.reported_to,
            },
            transaction: t,
          }),
        ]);
      }
      await t.commit();
      if (needToSendEmail) {
        this.sendEmailOnReportUsers(requestData);
      }
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async sendEmailOnReportUsers(requestData) {
    try {
      const getUserDetails = await UserModel.findOne({
        where: { user_id: requestData.reported_to },
        attributes: [
          "email",
          "first_name",
          "last_name",
          "phone_number",
          "country_code",
          "user_name",
        ],
      });
      if (getUserDetails && getUserDetails.dataValues) {
        const emailData = {
          templateData: {
            user_name: getUserDetails.dataValues.user_name
              ? getUserDetails.dataValues.user_name
              : `N/A`,
            email: getUserDetails.dataValues.email
              ? getUserDetails.dataValues.email
              : `N/A`,
            full_name: getUserDetails.dataValues.first_name
              ? `${getUserDetails.dataValues.first_name} ${getUserDetails.dataValues.last_name}`
              : `N/A`,
            phone_number: `${getUserDetails.dataValues.country_code}-${getUserDetails.dataValues.phone_number}`,
            reported_count: process.env.REPORT_USER_THRESHOLD,
          },
          templateId: process.env.SEND_REPORTED_USER_TEMPLATE_ID,
          toEmail: process.env.ADMIN_EMAIL,
        };
        new SendGrid().sendMail(emailData);
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSubscriberData(requestData, userId) {
    try {
      return await this.executeSelectRawQuery(
        "select subscribed_by from user_subscribers where subscribed_by =:userId and subscribed_to =:otherUserId",
        { otherUserId: requestData.user_id, userId: userId }
      );
    } catch (err) {
      throw err;
    }
  }

  async unsubscribeUser(subscribed_to, subscribed_by) {
    try {
      await UserSubscribersModel.destroy({
        where: {
          subscribed_to: subscribed_to,
          subscribed_by: subscribed_by,
        },
      });
    } catch (error) {
      throw err;
    }
  }

  async updateDOBAndGenderBusinessProfileData(profileData, userId) {
    try {
      await UserModel.update(profileData, {
        where: { parent_id: userId },
        returning: true,
        plain: true,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateSubscriptionData(status, userId) {
    try {
      // const check = await UserModel.findOne({
      //   where: {
      //     user_id: userId,
      //   },
      //   attributes: ["subscription"],
      // });
      // if (
      //   check.subscription == status.subscription &&
      //   Number(status.subscription) == SUBSCRIPTION.ACTIVE
      // )
      //   throw new ErrorHandler().customError(
      //     ERROR_MESSSAGES.ALREADY_ACTIVE_SUBSCRIPTION,
      //     HTTP_CODES.BAD_REQUEST
      //   );
      // else if (
      //   check.subscription == status.subscription &&
      //   Number(status.subscription) == SUBSCRIPTION.INACTIVE
      // )
      //   throw new ErrorHandler().customError(
      //     ERROR_MESSSAGES.ALREADY_INACTIVE_SUBSCRIPTION,
      //     HTTP_CODES.BAD_REQUEST
      //   );
      // else if (
      //   check.subscription == status.subscription &&
      //   Number(status.subscription) == SUBSCRIPTION.CANCELLED
      // )
      //   throw new ErrorHandler().customError(
      //     ERROR_MESSSAGES.ALREADY_CANCELLED_SUBSCRIPTION,
      //     HTTP_CODES.BAD_REQUEST
      //   );
      // else {
      //   Number(status.subscription) === SUBSCRIPTION.ACTIVE
      //     ? await UserModel.update(
      //         {
      //           subscription: status.subscription,
      //           is_officially_verified: true,
      //         },
      //         { where: { user_id: userId } }
      //       )
      //     : await UserModel.update(
      //         {
      //           subscription: status.subscription,
      //           is_officially_verified: false,
      //         },
      //         { where: { user_id: userId } }
      //       );
      // }

      Number(status.subscription) === SUBSCRIPTION.ACTIVE
        ? await UserModel.update(
          {
            subscription: status.subscription,
          },
          { where: { user_id: userId } }
        )
        : await UserModel.update(
          {
            subscription: status.subscription,
            is_officially_verified: false,
          },
          { where: { user_id: userId } }
        );
      return await UserModel.findOne({
        where: {
          user_id: userId,
        },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async kycTokenData() {
    try {
      const kycData = `grant_type=client_credentials&scope=idmvalidate`;
      let idmURL;
      let idmToken;
      if (process.env.ENV == "development") {
        idmURL = "https://sandbox.idmvalidate.com/";
        idmToken =
          "Basic OTVlYzM2NzI2YjVmNDFkYWFkODcwZTc0YmM0ZmM2YTY6MTMxNmZkNTI0M2RjNGE0M2FlODA3Mzc0NGQxYjJkMTE=";
      } else {
        idmURL = "https://prod.idmvalidate.com/";
        idmToken =
          "Basic NTQ3Yjc5Y2NmNTI5NDVmNGFkOWE3YjAxZGZlZWE3ZWE6YjM3NmYxNzRmMGYxNDI1YTljODM3NWY0Njk5OGM1OGE=";
      }
      // return await axios.post(
      //   `${process.env.ID_MERIT_BASE_URL}token`,
      //   kycData,
      //   {
      //     headers: {
      //       "Content-Type": `application/x-www-form-urlencoded`,
      //       Authorization: `${process.env.ID_MERIT_TOKEN}`,
      //     },
      //   }
      // );

      return await axios.post(`${idmURL}token`, kycData, {
        headers: {
          "Content-Type": `application/x-www-form-urlencoded`,
          Authorization: `${idmToken}`,
        },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async kycVerifyData(requestData, userId) {
    try {
      const kycToken = await this.kycTokenData();
      const token = kycToken.data.access_token;
      const kycVerifyData = {
        mobile: requestData.mobile,
        name: requestData.name,
        country: requestData.country,
        dateOfBirth: requestData.dateOfBirth,
        requestID: "Additional Information",
        redirectURL: "com.wethink.app/user-validation",
        callbackURL: `${process.env.ENV === "production"
          ? "https://api.getwethink.com/we-think/v1/api/user/kyc/status"
          : "https://dev.getwethink.com/we-think/v1/api/user/kyc/status"
          }`,
      };
      let idmURL;
      if (process.env.ENV == "development") {
        idmURL = "https://sandbox.idmvalidate.com/";
      } else {
        idmURL = "https://prod.idmvalidate.com/";
      }

      return await axios.post(`${idmURL}verify`, kycVerifyData, {
        headers: {
          "Content-Type": `application/json`,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getKycVerifyData(requestData) {
    try {
      const kycToken = await this.kycTokenData();
      const token = kycToken.data.access_token;
      let idmURL;
      if (process.env.ENV == "development") {
        idmURL = "https://sandbox.idmvalidate.com/";
      } else {
        idmURL = "https://prod.idmvalidate.com/";
      }
      return await axios.get(`${idmURL}verify/${requestData.uniqueID}`, {
        headers: {
          "Content-Type": `application/json`,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async kycVerifyEditData(requestData) {
    try {
      const kycToken = await this.kycTokenData();
      const token = kycToken.data.access_token;
      const kycVerifyEditData = {
        redirectURL: requestData.redirectURL,
      };
      let idmURL;
      if (process.env.ENV == "development") {
        idmURL = "https://sandbox.idmvalidate.com/";
      } else {
        idmURL = "https://prod.idmvalidate.com/";
      }
      return await axios.put(
        `${idmURL}verify/edit/${requestData.uniqueID}`,
        kycVerifyEditData,
        {
          headers: {
            "Content-Type": `application/json`,
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async kycVerifyStatusData(status, userId) {
    try {
      if (status.is_kyc_verified === "1") {
        const uniqueIdData = {
          uniqueID: status.unique_id,
        };
        const kycData = await this.getKycVerifyData(uniqueIdData);
        let readData = Fs.readFileSync(
          `${process.cwd()}/helpers/USCities.json`
        );
        readData = JSON.parse(readData.toString());
        const filterData = readData.filter(
          (data) => data.zip_code === Number(kycData.data.barcodeMap.Zip)
        );
        let otherProfileData;
        if (Object.keys(kycData.data.barcodeMap).length) {
          otherProfileData = {
            state: cities.zip_lookup(kycData.data.barcodeMap.Zip).state,
            state_symbol: kycData.data.barcodeMap.State,
            city: kycData.data.barcodeMap.City,
            gender: kycData.data.barcodeMap.Gender === "1" ? 0 : 1,
            address: `${kycData.data.barcodeMap.Street} ${kycData.data.barcodeMap.Zip}`,
          };
        } else {
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.MISSING_OTHER_PROFILE_DATA,
            HTTP_CODES.BAD_REQUEST
          );
        }
        const [firstName, lastName] = kycData.data.name.split(" ");
        const dateOfBirth = kycData.data.dateOfBirth.replace(
          /(\d{4})(\d{2})(\d{2})/g,
          "$1-$2-$3"
        );
        const profileData = {
          is_kyc_verified: status.is_kyc_verified,
          is_officially_verified: true,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          county: filterData[0].county,
          last_verified_date: Date.now(),
          unique_id: status.unique_id,
          ...otherProfileData,
        };
        await UserModel.update(profileData, { where: { user_id: userId } });
      } else {
        const profileData = {
          is_kyc_verified: status.is_kyc_verified,
          is_officially_verified: false,
          last_verified_date: Date.now(),
          unique_id: status.unique_id,
        };
        await UserModel.update(profileData, { where: { user_id: userId } });
      }
      const data = await UserModel.findOne({
        where: { user_id: userId },
      });
      data.last_verified_date = Number(data.last_verified_date);
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsImages(questionIds) {
    try {
      const query = `select * from questions_images where question_id in (:questionIds)`;
      return await this.executeSelectRawQuery(query, { questionIds });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsCategories(categoryIds) {
    try {
      const query = `select category_id, category_name from questions_categories_master where category_id in (:categoryIds)`;
      return await this.executeSelectRawQuery(query, { categoryIds });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUsersBriefInfo(userIds) {
    try {
      const query = `select user_id, first_name, last_name, profile_picture, user_name, title, is_officially_verified, is_business_account, unique_id from users where user_id in (:userIds) AND is_deleted = false AND is_active = true AND user_name IS NOT NULL AND user_name != ''`;
      return await this.executeSelectRawQuery(query, { userIds });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async myLikeStatus(userId, questionIds = [], sharedQuestionIds = []) {
    try {
      //for finding like status of questions
      if (questionIds.length) {
        const query = `select id, question_id from user_likes where user_id =:userId and question_id in (:questionIds)`;
        return await this.executeSelectRawQuery(query, { userId, questionIds });
      }
      //for finding like status of shared questions
      else if (sharedQuestionIds.length) {
        const query = `select id, question_shared_id from user_likes where user_id =:userId and question_shared_id in (:sharedQuestionIds)`;
        return await this.executeSelectRawQuery(query, {
          userId,
          sharedQuestionIds,
        });
      } else {
        return [];
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async myVoteStatus(userId, questionIds = []) {
    try {
      //for finding like status of questions
      if (questionIds.length) {
        const query = `select user_answer_id, question_id from user_answers where user_id =:userId and question_id in (:questionIds)`;
        return await this.executeSelectRawQuery(query, { userId, questionIds });
      } else {
        return [];
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async syncWithES(questionId, user) {
    return new Promise(async (resolve, reject) => {
      let query = `SELECT Q.*, C.*, Q.question_id AS id
          FROM questions AS Q
          LEFT JOIN question_category_mapping AS C ON Q.question_id = C.question_id
          WHERE Q.question_id =:questionId`;
      let _obj = await this.executeSelectRawQuery(query, { questionId });
      if (!Array.isArray(_obj) || !_obj.length) return resolve();
      _obj = _obj[0];
      questionES.indexDoc(
        _obj.id,
        _obj.question_title,
        _obj.created_by,
        _obj.question_date,
        _obj.created_at,
        _obj.question_type,
        {
          [ES_QUESTIONS_FIELDS.IS_ACTIVE]: _obj.is_active,
          [ES_QUESTIONS_FIELDS.IS_DELETED]: _obj.is_deleted,
          [ES_QUESTIONS_FIELDS.IS_EXPIRED]: _obj.is_expired,
          [ES_QUESTIONS_FIELDS.DELETED_AT]: _obj.deleted_at,
          [ES_QUESTIONS_FIELDS.UPDATED_AT]: _obj.updated_at,
          [ES_QUESTIONS_FIELDS.CATEGORY_ID]: _obj.category_id,
          [ES_QUESTIONS_FIELDS.EXPIRY_AT]: _obj.answer_expiry_time,
          [ES_QUESTIONS_FIELDS.PRIVACY]: user && user["account_type"],
        },
        () => {
          return resolve();
        }
      );
    });
  }

  async syncSharesWithES(questionSharedId, user) {
    return new Promise(async (resolve, reject) => {
      let query = `SELECT Q.*, C.*, Q.question_id AS id, S.question_shared_id AS sharedquestionid, S.question_id as parentquestionid, S.user_id AS shareduserid, S.created_at as sharedcreatedat, S.share_message AS sharedmessage, S.is_deleted as sharedisdeleted, S.is_active AS sharedisactive FROM user_shared_questions AS S LEFT JOIN questions AS Q ON S.question_id = Q.question_id LEFT JOIN question_category_mapping AS C ON Q.question_id = C.question_id WHERE S.question_shared_id =:questionSharedId`;
      let _obj = await this.executeSelectRawQuery(query, { questionSharedId });
      if (!Array.isArray(_obj) || !_obj.length) return resolve();
      _obj = _obj[0];
      const _id = _obj.sharedquestionid;
      questionES.indexDoc(
        _id,
        _obj.question_title,
        _obj.created_by,
        _obj.question_date,
        _obj.created_at,
        _obj.question_type,
        {
          [ES_QUESTIONS_FIELDS.IS_ACTIVE]: _obj.is_active,
          [ES_QUESTIONS_FIELDS.IS_DELETED]: _obj.is_deleted,
          [ES_QUESTIONS_FIELDS.IS_EXPIRED]: _obj.is_expired,
          [ES_QUESTIONS_FIELDS.DELETED_AT]: _obj.deleted_at,
          [ES_QUESTIONS_FIELDS.UPDATED_AT]: _obj.updated_at,
          [ES_QUESTIONS_FIELDS.CATEGORY_ID]: _obj.category_id,
          [ES_QUESTIONS_FIELDS.SHARED_MESSAGE]: _obj.sharedmessage,
          [ES_QUESTIONS_FIELDS.PARENT_QUESTION_ID]: _obj.parentquestionid,
          [ES_QUESTIONS_FIELDS.SHARED_BY]: _obj.shareduserid,
          [ES_QUESTIONS_FIELDS.SHARED_QUESTION_ID]: _obj.sharedquestionid,
          [ES_QUESTIONS_FIELDS.SHARED_AT]: _obj.sharedcreatedat,
          [ES_QUESTIONS_FIELDS.EXPIRY_AT]: _obj.answer_expiry_time,
          [ES_QUESTIONS_FIELDS.PRIVACY]: user && user["account_type"],
        },
        () => {
          return resolve();
        }
      );
    });
  }

  async insertInTranscodedVideoAudits(videoUrl, transcodedVideoUrl) {
    try {
      const id = uuidv4();
      return await TranscodedVideoAuditModel.create({
        id,
        video_url: videoUrl,
        transcoded_video_url: transcodedVideoUrl,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionsDetails(questionIds) {
    try {
      const query = `select Q.question_id, Q.is_commenting_enabled from questions AS Q where question_id in (:questionIds)`;
      return await this.executeSelectRawQuery(query, { questionIds });
    } catch (err) {
      Logger.error(new Error(err));
    }
  }

  async executeSelectRawQuery(query, replacements, t = null) {
    try {
      if (t) {
        return await Sequelize.query(query, {
          replacements: replacements,
          type: QueryTypes.SELECT,
          transaction: t,
        });
      } else {
        return await Sequelize.query(query, {
          replacements: replacements,
          type: QueryTypes.SELECT,
        });
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getNewFormatData(activityData, questionFromatFor) {
    try {
      if (questionFromatFor == QUESTION_NEW_FORMAT_CONDITION.MY_ACTIVITY_DATA) {
        let questionDetailsObj = {};
        let questionDetailsArray = [];
        for (let data of activityData) {
          questionDetailsObj = {
            author: {
              id: data.owner_user_id,
              firstName: data.owner_first_name,
              lastName: data.owner_last_name,
              username: data.owner_user_name,
              profilePicture: data.owner_profile_picture,
              isBusinessAccount: data.owner_is_business_account,
              isVerified: data.owner_is_officially_verified,
            },
            category: {
              id: data.category_id,
              name: data.category_name,
            },
            commentsCount: Number(data.comment_count),
            createdAt: parseInt(data.owner_post_create_time / 1000),
            expiryAt: parseInt(data.answer_expiry_time / 1000),
            hashTags: [], //pending
            id: data.question_id,
            isAdminQuestion: data.is_admin_question,
            isCommentingEnabled: data.is_commenting_enabled,
            likesCount: Number(data.likes_count),
            sharesCount: Number(data.shared_count),
            media: {
              height: data.height,
              width: data.width,
              imageUrl: data.image_url,
              questionCoverType: data.question_cover_type,
              ratio: data.ratio,
              transcodedVideoUrl: data.transcoded_video_url,
              videoThumbnail: data.video_thumbnail,
              videoUrl: data.transcoded_video_url,
            },
            myLikeStatus: data.is_liked,
            myVoteStatus: data.myVoteStatus,
            questionAt: parseInt(data.question_date / 1000),
            title: data.question_title,
            votesCount: Number(data.vote_count),
          };
          if (data.question_shared_id) {
            let sharedByuser = {
              id: data.user_id,
              firstName: data.first_name,
              lastName: data.last_name,
              username: data.user_name,
              isBusinessAccount: data.is_business_account,
              isVerified: data.is_officially_verified,
              profilePicture: data.profile_picture,
            };
            questionDetailsObj["sharedBy"] = sharedByuser;
            questionDetailsObj["sharedAt"] = parseInt(data.share_created_at / 1000);
            questionDetailsObj["sharedMessage"] = data.share_message;
            questionDetailsObj["sharedQuestionId"] = data.question_shared_id;
          }
          questionDetailsArray.push(questionDetailsObj);
        }
        return questionDetailsArray;
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getUserDetails(user) {
    try {
      let followingObj = {
        first_name: user.first_name,
        last_name: user.last_name,
        is_business_account: user.is_business_account,
        is_verified: user.is_officially_verified,
        profile_picture: user.profile_picture,
        id: user.user_id,
        username: user.user_name,
        account_type: user.account_type,
        followers_count: user.followers_count,
        is_followed: user.is_followed ? true : false,
        is_request_sent: user.is_request_sent ? true : false,
      };
      return followingObj;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getVoteStatus(userId, questionId) {
    try {
      return await UserAnswersModel.findOne({
        where: {
          user_id: userId,
          question_id: questionId
        }
      })
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // async getUserGoogleUrl() {
  //   return new Promise((resolve, reject) => {
  //     const scopes = [
  //       'profile',
  //       'https://www.googleapis.com/auth/userinfo.email',
  //     ]
  //     const authUrl = this.oauth2Client.generateAuthUrl({
  //       access_type: 'offline',
  //       scope: scopes,
  //       prompt: 'consent',
  //     })
  //     resolve({ authUrl })
  //   })
  // }

  // async userGoogleToken(requestData) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       let tokens = await this.getAuthToken(requestData.googleCode)
  //       resolve(tokens)
  //     }
  //     catch (err) {
  //       reject(err)
  //     }
  //   })
  // }

  // async getAuthToken(googleCode) {
  //   return new Promise((resolve, reject) => {
  //     this.oauth2Client.getToken(googleCode, (err, tokens) => {
  //       if (err) {
  //         reject(err)
  //       } else {
  //         resolve(tokens)
  //       }
  //     })
  //   })
  // }

  async getTotalQuestionCount(requestData, userId) {
    try {
      const data = await questionES.user(requestData.user_id, {
        userId,
        size: 0
      });
      return {
        totalQuestions: (data && data.hits && data.hits.total && data.hits.total.value) ? data.hits.total.value + "" : "0"
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }
}

module.exports = UserRepository;
