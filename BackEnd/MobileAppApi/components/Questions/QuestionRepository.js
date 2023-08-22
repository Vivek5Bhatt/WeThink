const {
  QuestionModel,
  UserSharedQuestionModel,
  UserCommentMentionsModel,
  UserCommentsModel,
  UserLikesModel,
  SilentPushAuditModel,
  ReportedCommentsModel,
  AnswerAuditModel,
  UsStateCountyMasterModel,
  ReportedQuestionModel,
  ThresholdMasterModel,
  PostCommentThresholdModel,
  NotificationsModel,
  CategoryMasterModel,
  UserModel,
  QuestionImagesModel,
} = require("../../models");
const Logger = require("../../helpers/Logger");
const Sequelize = require("../../config/connection");
const { QueryTypes } = require("../../config/connection");
const { v4: uuidv4 } = require("uuid");
const {
  ACCOUNT_TYPE,
  GET_COMMENT_TYPE,
  ROLE_IDS,
  REPORT_STATUS,
  THRESHOLD_TYPE,
  ERROR_MESSSAGES,
  HTTP_CODES,
  REPLY_SCROLL_TYPE,
} = require("../../utils/Constants");
const Fs = require("fs");
const ErrorHandler = require("../../helpers/ErrorHandler");
const QuestionSearchSuggestions = require("../../models/QuestionSearchSuggestions");
const { question: ESQuestion } = require("../../elasticsearch");
const moment = require('moment');

QuestionModel.belongsTo(QuestionImagesModel, {
  foreignKey: "question_id",
  targetKey: "question_id",
});

class QuestionRepository {
  constructor() { }

  async enableDisableCommenting(requestData, userId) {
    try {
      const checkQuestionExit = await QuestionModel.findOne({
        where: { question_id: requestData.id },
      });
      if (checkQuestionExit) {
        const checkQuestion = await QuestionModel.findOne({
          where: {
            question_id: requestData.id,
            is_commenting_enabled: requestData.status,
          },
        });
        if (!checkQuestion)
          return await QuestionModel.update(
            { is_commenting_enabled: requestData.status },
            { where: { question_id: requestData.id, created_by: userId } }
          );
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_STATUS_UPDATED,
          HTTP_CODES.BAD_REQUEST
        );
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_QUESTION_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createComment(requestData, userId) {
    const t = await Sequelize.transaction();
    try {
      const commentId = uuidv4();
      await UserCommentsModel.create(
        {
          comment_id: commentId,
          user_id: userId,
          comment: requestData.comment,
          question_id: requestData.question_id,
          created_at: Date.now(),
          parent_id: requestData.parent_id || null,
          question_shared_id: requestData.question_shared_id || null,
        },
        { transaction: t }
      );

      let userMentions = [];
      if (requestData.new) {
        //picking tagged users starts
        let _taggedUserIds = [];
        if (requestData.comment) {
          const taggedUsernames = requestData.comment
            .split(" ")
            .filter((el) => el.startsWith("@"))
            .map((el) => el.replace("@", ""))
            .filter((el) => el);
          if (Array.isArray(taggedUsernames) && taggedUsernames.length) {
            const query = `SELECT user_id FROM users where user_name in (:taggedUsernames)`;
            _taggedUserIds = await this.executeSelectRawQuery(query, {
              taggedUsernames,
            });
          }
          if (Array.isArray(_taggedUserIds) && _taggedUserIds.length) {
            _taggedUserIds = [
              ...new Set(_taggedUserIds.map((_obj) => _obj.user_id)),
            ];
          }
        }
        //picking tagged users ends
        for (const x of _taggedUserIds) {
          userMentions.push({
            comment_mention_id: uuidv4(),
            comment_id: commentId,
            user_id: x,
            created_at: Date.now(),
          });
        }
      } else {
        if (requestData.user_mentions && requestData.user_mentions.length) {
          for (const x of requestData.user_mentions) {
            userMentions.push({
              comment_mention_id: uuidv4(),
              comment_id: commentId,
              user_id: x,
              created_at: Date.now(),
            });
          }
        }
      }
      userMentions.length &&
        (await UserCommentMentionsModel.bulkCreate(userMentions, {
          transaction: t,
        }));
      await t.commit();
      return commentId;
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getCommentsLists(requestData, userId) {
    try {
      let filterQuery = ``;
      let auditObj = {};
      auditObj.user_id = userId;
      auditObj.id = uuidv4();
      if (
        parseInt(requestData.get_comment_type) ===
        GET_COMMENT_TYPE.QUESTION_TYPE
      ) {
        filterQuery += ` user_comments.question_id=:id `;
        auditObj.question_id = requestData.id;
      } else if (
        parseInt(requestData.get_comment_type) === GET_COMMENT_TYPE.SHARED_TYPE
      ) {
        filterQuery += ` user_comments.question_shared_id=:id `;
        auditObj.question_shared_id = requestData.id;
      }
      const query = `SELECT(SELECT COUNT(user_comments.comment_id) FROM "user_comments"  WHERE  ${filterQuery} AND user_comments.parent_id is null AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments"  WHERE (comment_id is not null) and  (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) ) AS total_count, (select array_agg('{ "user_id": ' || CONCAT('"',sq1.user_id,'"') || ', "user_name": ' || CONCAT('"',sq1.user_name,'"') ||',"comment_id": ' || CONCAT('"',sq1.comment_id,'"') || '}') AS "mentioned_user" FROM ( SELECT "user_comments"."comment_id","mentioned_users"."user_name","mentioned_users"."user_id","mentioned_users"."profile_picture" FROM "user_comments" INNER JOIN "users" USING ("user_id") INNER JOIN "user_comment_mentions" ON "user_comment_mentions"."comment_id"="user_comments"."comment_id" INNER JOIN "users" AS "mentioned_users" ON "mentioned_users"."user_id"="user_comment_mentions"."user_id"  WHERE ${filterQuery} AND "user_comments"."parent_id" IS NULL AND "user_comment_mentions"."user_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) ) AS sq1) AS mentioned_users_data, 
      (select array_agg('{ "user_id": ' || CONCAT('"',sq3.user_id,'"') || ', "user_name": ' || CONCAT('"',sq3.user_name,'"') ||',"comment_id": ' || CONCAT('"',sq3.comment_id,'"') || '}') AS "mentioned_user_reply" FROM ( SELECT "user_comments"."comment_id","mentioned_users"."user_name","mentioned_users"."user_id","mentioned_users"."profile_picture" FROM "user_comments" INNER JOIN "users" USING ("user_id") INNER JOIN "user_comment_mentions" ON "user_comment_mentions"."comment_id"="user_comments"."comment_id" INNER JOIN "users" AS "mentioned_users" ON "mentioned_users"."user_id"="user_comment_mentions"."user_id"  WHERE  ${filterQuery} AND "user_comments"."parent_id" IS NOT NULL  AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND  "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) AND ((("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) ) AS sq3) AS reply_mentioned_users_data, 
      (select array_agg('{ "comment_id": ' || CONCAT('"',sq4.comment_id,'"') || ', "user_name": ' || CONCAT('"',sq4.user_name,'"') || ' ,"comment": ' || CONCAT('"',sq4.comment,'"') ||' , "profile_picture": ' || CONCAT('"',sq4.profile_picture,'"') ||',"parent_id": ' || CONCAT('"',sq4.parent_id,'"') ||', "user_id": ' || CONCAT('"',sq4.user_id,'"') || ',"created_at": ' || CONCAT('"',sq4.created_at,'"') || ' }') AS "reply_count_data" FROM (SELECT "parent"."comment_id",parent.comment,users.user_name,users.profile_picture,parent.parent_id,parent.user_id,parent.created_at FROM "user_comments" INNER JOIN "user_comments" AS "parent" ON "user_comments"."comment_id"="parent"."parent_id" AND "parent"."parent_id"="user_comments"."comment_id" INNER JOIN "users" ON "users"."user_id"="parent"."user_id"  WHERE ${filterQuery} AND "parent"."parent_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "parent"."is_active"=true AND "parent"."is_deleted"=false AND "parent"."user_id" NOT IN ${this.getBlockCondition()} AND "parent"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) ORDER BY "parent"."created_at" DESC) AS sq4) AS comment_reply_data, 
      user_comments.comment_id,user_comments.created_at,user_comments.comment,commented_users.user_name,commented_users.profile_picture,user_comments.user_id, (select array_agg('{ "comment_id": ' || CONCAT('"',sq2.comment_id,'"') || ', "count": ' || CONCAT('"',sq2.count,'"') || '}') AS "reply_count" FROM (SELECT COUNT(parent.parent_id) AS count,"user_comments"."comment_id" FROM "user_comments" LEFT JOIN "user_comments" AS "parent" ON "user_comments"."comment_id"="parent"."parent_id" AND "parent"."parent_id"="user_comments"."comment_id"  WHERE ${filterQuery} AND "parent"."parent_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "parent"."is_active"=true AND "parent"."is_deleted"=false AND "parent"."user_id" NOT IN ${this.getBlockCondition()} GROUP BY "user_comments"."comment_id" ) AS sq2) AS comment_reply FROM user_comments INNER JOIN "users" AS "commented_users" ON "commented_users"."user_id"="user_comments"."user_id"  WHERE (user_comments.parent_id IS NULL AND ${filterQuery} AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus))  ORDER BY "user_comments"."created_at" DESC OFFSET :offset limit  :limit`;
      // await this.createAuditForCommentSilentPush(auditObj);
      return await this.executeSelectRawQuery(query, {
        id: requestData.id,
        offset: parseInt(requestData.offset),
        limit: parseInt(requestData.limit),
        userId: userId,
        reportStatus: REPORT_STATUS.PENDING,
        acceptedReportedStatus: REPORT_STATUS.ACCEPTED,
        rejectedReportedStatus: REPORT_STATUS.REJECTED,
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

  async getReplyCommentLists(requestData, userId) {
    try {
      const query = `SELECT (SELECT COUNT(comment_id) FROM "user_comments"  WHERE "user_id" NOT IN ${this.getBlockCondition()} AND "parent_id"=:parentId AND "comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE comment_id is not null and  (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) ) AS total_count,(select array_agg('{ "user_id": ' || CONCAT('"',sq1.user_id,'"') || ', "user_name": ' || CONCAT('"',sq1.user_name,'"') ||',"comment_id": ' || CONCAT('"',sq1.comment_id,'"') || '}') AS "mentioned_user" FROM ( SELECT "user_comments"."comment_id","mentioned_users"."user_name","mentioned_users"."user_id","mentioned_users"."profile_picture" FROM "user_comments" INNER JOIN "users" USING ("user_id") LEFT JOIN "user_comment_mentions" ON "user_comment_mentions"."comment_id"="user_comments"."comment_id" LEFT JOIN "users" AS "mentioned_users" ON "mentioned_users"."user_id"="user_comment_mentions"."user_id"  WHERE  "user_comments"."parent_id"=:parentId AND "user_comment_mentions"."user_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE comment_id is not null and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus)) AS sq1) AS mentioned_users_data, user_comments.comment_id,user_comments.created_at,user_comments.comment,commented_users.user_name,commented_users.profile_picture,user_comments.parent_id,user_comments.user_id FROM user_comments INNER JOIN "users" AS "commented_users" ON "commented_users"."user_id"="user_comments"."user_id"  WHERE "user_comments"."parent_id"=:parentId AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN  (SELECT "comment_id" FROM "reported_comments" WHERE comment_id is not null and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus)  ORDER BY "user_comments"."created_at" DESC OFFSET :offset limit  :limit`;
      return await this.executeSelectRawQuery(query, {
        parentId: requestData.parent_id,
        offset: parseInt(requestData.offset),
        limit: parseInt(requestData.limit),
        reportStatus: REPORT_STATUS.PENDING,
        userId: userId,
        acceptedReportedStatus: REPORT_STATUS.ACCEPTED,
        rejectedReportedStatus: REPORT_STATUS.REJECTED,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async mentionUsers(requestData, userId) {
    try {
      let selectUserNameQuery;
      if (
        requestData.device_type &&
        parseInt(requestData.device_type) === DEVICE_TYPE.IOS
      ) {
        selectUserNameQuery = ` CONCAT('@',"users"."user_name") AS "user_name" `;
      } else {
        selectUserNameQuery = ` "users"."user_name" `;
      }
      const query = `SELECT (SELECT COUNT(*) FROM "users" LEFT JOIN (select "user_follows"."follows_id","user_follows"."followed_to" FROM "user_follows" INNER JOIN "user_follows" as "follower" ON "follower"."followed_by"="user_follows"."followed_to" AND "follower"."followed_to"="user_follows"."followed_by" WHERE "user_follows"."followed_by"=:userId) subQuery ON subQuery.followed_to=users.user_id WHERE ( is_active=true AND "users"."user_id"!=:userId AND "users"."user_id" NOT IN ${this.getBlockCondition()} AND (subQuery.follows_id IS NULL AND ("users"."user_name" ilike :search OR users.first_name ilike :search OR users.last_name ilike :search OR CONCAT("first_name",'',"last_name") ilike :search ) AND "account_type"=:accountType) OR (subQuery.follows_id IS NOT NULL AND ("user_name" ilike :search OR users.first_name ilike :search OR users.last_name ilike :search OR CONCAT("first_name",'',"last_name") ilike :search) ))) AS "total_count", "users"."user_id",${selectUserNameQuery},"users"."first_name","users"."last_name",CONCAT("first_name",'',"last_name") AS "full_name","users"."profile_picture","users"."is_officially_verified","users"."is_business_account","users"."unique_id" FROM "users" LEFT JOIN (select "user_follows"."follows_id","user_follows"."followed_to" FROM "user_follows" INNER JOIN "user_follows" as "follower" ON "follower"."followed_by"="user_follows"."followed_to" AND "follower"."followed_to"="user_follows"."followed_by" WHERE "user_follows"."followed_by"=:userId) subQuery ON subQuery.followed_to=users.user_id WHERE ( is_active=true AND "users"."user_id"!=:userId  AND "users"."user_id" NOT IN ${this.getBlockCondition()} AND (subQuery.follows_id IS NULL AND ("users"."user_name" ilike :search OR users.first_name ilike :search OR users.last_name ilike :search OR CONCAT("first_name",'',"last_name") ilike :search ) AND "account_type"=:accountType) OR (subQuery.follows_id IS NOT NULL AND ("user_name" ilike :search OR users.first_name ilike :search OR users.last_name ilike :search OR CONCAT("first_name",'',"last_name") ilike :search) )) ORDER BY "users"."created_at" DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      return await this.executeSelectRawQuery(query, {
        search: `%${requestData.search}%`,
        userId: userId,
        page_number: parseInt(requestData.page_number),
        limit: parseInt(requestData.limit),
        accountType: ACCOUNT_TYPE.PUBLIC,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getCommentDetails(requestData, userId, isReported = false) {
    try {
      let reportQuery = ``;
      const replaceMents = {
        questionId: requestData.question_id,
        commentId: requestData.comment_id,
        userId: userId,
        reportStatus: REPORT_STATUS.PENDING,
      };
      if (isReported) {
        reportQuery += `  AND "reported_comments"."comment_id"=:commentId`;
        replaceMents.questionSharedId = requestData.question_shared_id;
      }
      let query = `SELECT "reported_comments"."report_status","questions"."question_id","user_comments"."user_id" AS "comment_user_id","questions"."created_by","user_shared_questions"."user_id" AS "shared_user_id","user_comments"."is_deleted" FROM "user_comments" INNER JOIN "questions" USING ("question_id") LEFT JOIN "user_shared_questions" ON "user_shared_questions"."question_shared_id"="user_comments"."question_shared_id" AND "user_comments"."comment_id"=:commentId AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false LEFT JOIN "reported_comments" ON "reported_comments"."reported_by"=:userId AND "reported_comments"."report_status"=:reportStatus AND "reported_comments"."question_id"=:questionId ${reportQuery} WHERE "user_comments"."comment_id"=:commentId AND "user_comments"."question_id"=:questionId`;
      return await this.executeSelectRawQuery(query, replaceMents);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateCommentDetails(updateData, requestData) {
    try {
      return await UserCommentsModel.update(updateData, {
        where: { comment_id: requestData.comment_id },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getCommentDetailsAfterAddition(commentId) {
    try {
      const query = `SELECT (select array_agg('{ "user_id": ' || CONCAT('"',sq1.user_id,'"') || ', "user_name": ' || CONCAT('"',sq1.user_name,'"') ||',"comment_id": ' || CONCAT('"',sq1.comment_id,'"') || '}') AS "mentioned_user" FROM ( SELECT "user_comments"."comment_id","mentioned_users"."user_name","mentioned_users"."user_id","mentioned_users"."profile_picture" FROM "user_comments" INNER JOIN "users" USING ("user_id") LEFT JOIN "user_comment_mentions" ON "user_comment_mentions"."comment_id"="user_comments"."comment_id" LEFT JOIN "users" AS "mentioned_users" ON "mentioned_users"."user_id"="user_comment_mentions"."user_id"  WHERE "user_comments"."comment_id"=:commentId  AND "user_comment_mentions"."user_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true ) AS sq1) AS mentioned_users_data,(SELECT COALESCE(COUNT(*),0) FROM "user_comments" WHERE "parent_id"=:commentId AND "is_active"=true AND "is_deleted"=false) AS "reply_count","comment_id","user_comments"."created_at","comment","user_name","profile_picture","user_comments"."user_id"  FROM "user_comments" INNER JOIN "users" USING ("user_id") WHERE "comment_id"=:commentId`;
      return await this.executeSelectRawQuery(query, { commentId: commentId });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getQuestionData(requestData) {
    try {
      return await QuestionModel.findOne({
        where: {
          question_id: requestData.question_id
        },
        attributes: ["question_id", "question_title"],
        include: [
          {
            model: QuestionImagesModel,
            required: false,
            attributes: ["image_url", "video_thumbnail"],
          },
        ],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async enableDisableCommentingOfSharedQuestion(requestData, userId) {
    try {
      return await UserSharedQuestionModel.update(
        { is_commenting_enabled: requestData.status },
        { where: { question_shared_id: requestData.id, user_id: userId } }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async likePost(requestData) {
    try {
      return await UserLikesModel.create(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getTotalLikesOnPost(questionSharedId, questionId = false) {
    try {
      let query;
      if (!questionId) {
        query = `SELECT  COALESCE(COUNT(*),0) AS count FROM user_likes WHERE question_shared_id=:questionSharedId`;
        return await this.executeSelectRawQuery(query, {
          questionSharedId: questionSharedId,
        });
      } else if (questionId) {
        query = ` SELECT  COALESCE(COUNT(*),0) AS count FROM user_likes WHERE question_id=:questionId AND question_shared_id IS NULL `;
        return await this.executeSelectRawQuery(query, {
          questionId: questionId,
        });
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getTrendingQuestions(requestData, userId) {
    try {
      let replacements = {};
      replacements.userId = userId;
      let categoryQuery = ``;
      if (requestData.category_filter) {
        requestData.category_filter = requestData.category_filter.split(",");
        categoryQuery = `  "category_id" IN (:categoryFilter)`;
        replacements.categoryFilter = requestData.category_filter;
      }
      let countQuery = `SELECT COUNT(*) FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN users ON users.user_id=questions.created_by AND users.is_active=true WHERE (questions.is_deleted=false AND questions.is_active=true) AND (questions.created_by!=:userId) AND "questions"."created_by" NOT IN  (SELECT "blocked_to" AS "user_id" FROM "user_blocks" WHERE "blocked_by"=:userId UNION SELECT "blocked_by" AS "user_id" FROM "user_blocks" WHERE "blocked_to"=:userId) AND questions.question_id NOT IN (SELECT question_id FROM reported_questions WHERE reported_by=:userId) `;
      let query = `SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video",(CASE WHEN users.role=:userRoleId THEN true ELSE false END) AS "is_user_question",(CASE WHEN users.role=:adminRoleId THEN true ELSE false END) AS "is_admin_question",({countQuery}) AS "total_count",(SELECT COALESCE(COUNT(*),0) FROM "user_answers" WHERE "question_id"="questions"."question_id") AS vote_count,questions.*,question_category_mapping.category_id,questions_images.image_url,questions_categories_master.category_name,users.role,questions_images.transcoded_video_url,questions_images.width,questions_images.height,questions_images.ratio,(CASE WHEN users.role=:roleId AND user_name is null THEN 'WeThink Admin' ELSE user_name END) AS user_name,users.first_name,(SELECT COUNT(comment_id) FROM user_comments WHERE user_comments.question_id=questions.question_id AND user_comments.user_id NOT IN ${this.getBlockCondition()} AND user_comments.comment_id NOT IN (SELECT comment_id FROM reported_comments WHERE reported_by=:userId ) AND user_comments.is_active=true AND user_comments.parent_id IS NULL AND user_comments.is_deleted=false) AS comment_count, (SELECT COUNT(id) FROM user_likes WHERE user_likes.question_id=questions.question_id) AS likes_count,(SELECT  COALESCE(COUNT(*),0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id"="questions"."question_id" AND  "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false) AS "shared_count", (CASE WHEN ( EXISTS (SELECT FROM "user_shared_questions" WHERE 
      "user_shared_questions"."user_id"=:userId AND "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false)) THEN true ELSE false END ) AS "is_shared",(CASE WHEN ( EXISTS (select from "user_likes" WHERE "user_likes"."user_id"=:userId AND "user_likes"."question_id"="questions"."question_id") ) THEN true ELSE false END ) AS "is_liked" FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id)  INNER JOIN questions_categories_master USING (category_id) INNER JOIN users ON users.user_id=questions.created_by LEFT JOIN "user_shared_questions" ON "user_shared_questions"."question_id"="questions"."question_id" INNER JOIN users ON users.user_id=questions.created_by AND users.is_active=true WHERE (questions.is_deleted=false AND questions.is_active=true AND questions.is_expired=false) AND (questions.created_by!=:userId) AND "questions"."created_by" NOT IN  (SELECT "blocked_to" AS "user_id" FROM "user_blocks" WHERE "blocked_by"=:userId UNION SELECT "blocked_by" AS "user_id" FROM "user_blocks" WHERE "blocked_to"=:userId) AND questions.question_id NOT IN (SELECT question_id FROM reported_questions WHERE reported_by=:userId )`;
      replacements.adminRoleId = String(ROLE_IDS.ADMIN);
      replacements.userRoleId = String(ROLE_IDS.USER);
      replacements.roleId = String(ROLE_IDS.ADMIN);
      if (requestData.category_filter) {
        query += ` AND ${categoryQuery}`;
        countQuery += ` AND ${categoryQuery}`;
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

  async disLikePost(requestData) {
    try {
      return await UserLikesModel.destroy({ where: requestData });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createAuditForCommentSilentPush(requestData) {
    try {
      return await SilentPushAuditModel.create(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteAuditForCommentSilentPush(requestData, userId) {
    try {
      const query = `DELETE FROM silent_push_audit WHERE "user_id"=:userId AND ("question_id"=:id OR "question_shared_id"=:id)`;
      return await this.executeDeleteRawQuery(query, {
        userId: userId,
        id: requestData.id,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async executeDeleteRawQuery(query, replacements) {
    try {
      return await Sequelize.query(query, {
        replacements: replacements,
        type: QueryTypes.DELETE,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getReportReasons(req) {
    try {
      const query = `SELECT id,name,type,created_at FROM report_master where is_deleted = false and type =:type ORDER BY created_at DESC`;
      return await this.executeSelectRawQuery(query, {
        type: Number(req.type),
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAlreadyReported(requestData, userId) {
    try {
      return await ReportedCommentsModel.findOne({
        where: {
          question_id: requestData.question_id,
          question_shared_id: requestData.question_shared_id,
          reported_by: userId,
          comment_id: requestData.comment_id,
          report_status: REPORT_STATUS.PENDING,
        },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async reportComment(requestData, userId) {
    const t = await Sequelize.transaction();
    try {
      const data = await ReportedCommentsModel.create(requestData);
      const getThresHoldPostCommentData =
        await PostCommentThresholdModel.findOne({
          where: { comment_id: requestData.comment_id },
        });
      if (
        getThresHoldPostCommentData &&
        getThresHoldPostCommentData.dataValues
      ) {
        getThresHoldPostCommentData.dataValues.report_count++;
        await PostCommentThresholdModel.increment(
          "report_count",
          { by: 1, where: { id: getThresHoldPostCommentData.dataValues.id } },
          { transaction: t }
        );
        if (
          +getThresHoldPostCommentData.dataValues.report_count ===
          +getThresHoldPostCommentData.dataValues.threshold_count
        ) {
          await UserCommentsModel.update(
            { is_active: false },
            { where: { comment_id: requestData.comment_id } },
            { transaction: t }
          );
          await UserCommentsModel.update(
            { is_active: false },
            { where: { parent_id: requestData.comment_id } },
            { transaction: t }
          );
          await PostCommentThresholdModel.update(
            { is_available: false },
            { where: { id: getThresHoldPostCommentData.dataValues.id } },
            { transaction: t }
          );
        }
      } else {
        const thresholdMasterData = await ThresholdMasterModel.findOne({
          where: { type: THRESHOLD_TYPE.REPORT_COMMENT },
        });
        if (thresholdMasterData && thresholdMasterData.dataValues) {
          await PostCommentThresholdModel.create({
            id: uuidv4(),
            comment_id: requestData.comment_id,
            type: THRESHOLD_TYPE.REPORT_COMMENT,
            threshold_count: thresholdMasterData.dataValues.threshold_count,
            report_count: 1,
          });
        } else return;
      }
      await NotificationsModel.destroy(
        {
          where: {
            comment_id: requestData.comment_id,
            receiver_id: requestData.reported_by,
          },
        },
        { transaction: t }
      );
      await t.commit();
      return data;
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getStateAndCountyMaster() {
    try {
      return await UsStateCountyMasterModel.findAll({
        order: [["state_name", "ASC"]],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getStateAndCountyMasterJsonCreator() {
    try {
      let readData = Fs.readFileSync(
        `${process.cwd()}/helpers/UsStateCounty.json`
      );
      readData = JSON.parse(readData.toString());
      const newProperJson = [];
      if (
        readData.objects.collection &&
        readData.objects.collection.geometries &&
        readData.objects.collection.geometries.length
      ) {
        for (const x of readData.objects.collection.geometries) {
          newProperJson.push(x.properties);
        }
      }
      const data = [];
      const checkSet = new Set();
      if (newProperJson.length) {
        for (const x of newProperJson) {
          if (x && !checkSet.has(x.state)) {
            data.push({
              state_name: x.state,
              state_symbol: x["iso_3166_2"],
              county_data: [],
            });
            checkSet.add(x.state);
          }
        }
        data.sort((x2, y2) => {
          if (x2.state_name > y2.state_name) {
            return 1;
          }
          if (x2.state_name < y2.state_name) {
            return -1;
          }
          return 0;
        });
        for (const x of data) {
          const countyData = newProperJson.filter(
            (y) => y["iso_3166_2"] === x.state_symbol
          );
          if (countyData.length) {
            countyData.sort((x1, y1) => {
              if (x1.name > y1.name) {
                return 1;
              }
              if (x1.name < y1.name) {
                return -1;
              }
              return 0;
            });
          }
          for (let y of countyData) {
            x.county_data.push({ name: y.name, data: [] });
          }
        }
      }
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getAnswerData() {
    try {
      return await AnswerAuditModel.findAll({});
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async executeUpdateQuery(query, replacements) {
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

  async updateMasterAndCounty() {
    try {
      const data = await this.getStateAndCountyMasterJsonCreator();
      const insertDataArray = [];
      if (data && data.length) {
        data.forEach((x) => {
          insertDataArray.push({
            id: uuidv4(),
            state_name: x.state_name,
            state_code: x.state_symbol,
            state_data: x.county_data,
            options: [],
          });
        });
      }
      const [checkData, checkAuditData] = await Promise.all([
        UsStateCountyMasterModel.findAll({}),
        AnswerAuditModel.findAll(),
      ]);
      if (checkData && !checkData.length) {
        await UsStateCountyMasterModel.bulkCreate(insertDataArray);
      }
      if (checkAuditData && !checkAuditData.length) {
        await AnswerAuditModel.bulkCreate(insertDataArray);
      }
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getMapData() {
    try {
      return await AnswerAuditModel.findAll({});
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async reportPost(requestData, userId) {
    const t = await Sequelize.transaction();
    try {
      const data = await ReportedQuestionModel.create(
        {
          id: uuidv4(),
          reported_by: userId,
          question_id: requestData.question_id,
          question_shared_id: requestData.question_shared_id || null,
          report_reason_id: requestData.report_reason_id || null,
          other_reason: requestData.other_reason || null,
          user_channel_id: `USER_${userId}_${requestData.question_id}`,
          group_channel_id: `GROUP_${requestData.question_id}`,
          created_at: Date.now(),
        },
        { transaction: t }
      );
      const whereCondition = {};
      if (requestData.question_shared_id)
        whereCondition.question_shared_id = requestData.question_shared_id;
      else whereCondition.question_id = requestData.question_id;
      const getThresHoldPostCommentData =
        await PostCommentThresholdModel.findOne({ where: whereCondition });
      if (
        getThresHoldPostCommentData &&
        getThresHoldPostCommentData.dataValues
      ) {
        getThresHoldPostCommentData.dataValues.report_count++;
        await PostCommentThresholdModel.increment(
          "report_count",
          { by: 1, where: { id: getThresHoldPostCommentData.dataValues.id } },
          { transaction: t }
        );
        if (
          +getThresHoldPostCommentData.dataValues.report_count ===
          +getThresHoldPostCommentData.dataValues.threshold_count
        ) {
          if (requestData.question_shared_id) {
            await UserSharedQuestionModel.update(
              { is_active: false },
              {
                where: {
                  question_shared_id:
                    getThresHoldPostCommentData.dataValues.question_shared_id,
                },
              },
              { transaction: t }
            );
          } else if (requestData.question_id) {
            await QuestionModel.update(
              { is_active: false },
              {
                where: {
                  question_id:
                    getThresHoldPostCommentData.dataValues.question_id,
                },
              },
              { transaction: t }
            );
            await UserSharedQuestionModel.update(
              { is_active: false },
              {
                where: {
                  question_id:
                    getThresHoldPostCommentData.dataValues.question_id,
                },
              },
              { transaction: t }
            );
          }
          await PostCommentThresholdModel.update(
            { is_available: false },
            { where: { id: getThresHoldPostCommentData.dataValues.id } },
            { transaction: t }
          );
        }
      } else {
        const thresholdMasterData = await ThresholdMasterModel.findOne({
          where: { type: THRESHOLD_TYPE.REPORT_POST },
        });
        if (thresholdMasterData && thresholdMasterData.dataValues) {
          await PostCommentThresholdModel.create({
            id: uuidv4(),
            question_id: requestData.question_id,
            type: THRESHOLD_TYPE.REPORT_POST,
            threshold_count: thresholdMasterData.dataValues.threshold_count,
            report_count: 1,
            question_shared_id: requestData.question_shared_id || null,
          });
        }
      }
      await NotificationsModel.destroy(
        { where: { ...whereCondition, ...{ receiver_id: userId } } },
        { transaction: t }
      );
      await t.commit();
      requestData.question_shared_id &&
        ESQuestion.report(requestData.question_shared_id, userId);
      requestData.question_id &&
        ESQuestion.report(requestData.question_id, userId);
      return data;
    } catch (err) {
      await t.rollback();
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAlreadyReportedPost(requestData, userId) {
    try {
      const data = await ReportedQuestionModel.findOne({
        where: { reported_by: userId, question_id: requestData.question_id },
      });
      return data && data.dataValues ? true : false;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async checkIfAlreadyLikesThePost(requestData, userId) {
    try {
      return await UserLikesModel.findOne({
        where: { user_id: userId, question_id: requestData.question_id },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }
  getBlockCondition() {
    return ` (SELECT "blocked_to" AS "user_id" FROM "user_blocks" WHERE "blocked_by"=:userId and blocked_to is not null UNION SELECT "blocked_by" AS "user_id" FROM "user_blocks" WHERE "blocked_to"=:userId and blocked_by is not null) `;
  }

  async getQuestionMetaData(requestData, userId) {
    try {
      let query = ``;
      if (
        parseInt(requestData.get_comment_type) ===
        GET_COMMENT_TYPE.QUESTION_TYPE
      ) {
        query += ` SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video", "questions"."question_id", null AS "question_shared_id", (SELECT  COALESCE(COUNT(*), 0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id" = "questions"."question_id" AND  "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false) AS "shared_count", (SELECT COALESCE(COUNT(user_likes.question_id), 0) FROM  "user_likes" WHERE "user_likes"."question_shared_id" IS NULL AND "user_likes"."question_id" = "questions"."question_id") AS "likes_count", (SELECT COALESCE(COUNT(user_answers.answer_id), 0) FROM "user_answers" WHERE "user_answers"."question_id"="questions"."question_id") AS "vote_count", (SELECT  COALESCE(COUNT(user_comments.comment_id), 0) FROM user_comments WHERE user_comments.question_id = questions.question_id AND user_comments.parent_id IS NULL AND user_comments.is_active = true AND user_comments.is_deleted = false AND user_comments.comment_id NOT IN (select comment_id FROM reported_comments WHERE reported_by =:userId and comment_id is not null) AND user_comments.user_id NOT IN ${this.getBlockCondition()}) AS comment_count, (CASE WHEN (EXISTS (select from "user_likes" WHERE "user_likes"."user_id" =:userId AND "user_likes"."question_id" = "questions"."question_id" AND "questions"."is_active" = true AND "questions"."is_deleted"=false)) THEN true ELSE false END) AS "is_liked", (CASE WHEN (EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id" =:userId AND "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false)) THEN true ELSE false END) AS "is_shared", questions_images.image_url, questions_images.video_thumbnail, questions_images.video_url, questions.question_title, null AS share_message, questions.is_commenting_enabled, questions.created_by AS user_id, questions.answer_expiry_time,
        question_category_mapping.category_id, null AS user_answer, questions_images.transcoded_video_url, questions_images.width, questions_images.height, questions_images.ratio, questions_images.question_cover_type, owner.profile_picture AS owner_profile_picture, owner.first_name AS owner_first_name, owner.last_name AS owner_last_name, owner.user_name AS owner_user_name, owner.is_business_account AS owner_is_business_account, owner.is_officially_verified AS owner_is_officially_verified, questions.created_at AS owner_post_create_time, questions.question_date AS question_date, CONCAT(owner.first_name,' ',owner.last_name) AS owner_full_name, (CASE WHEN owner.role =:adminRoleId THEN true ELSE false END) AS is_admin_question, owner.user_id AS owner_user_id FROM "questions" LEFT JOIN "questions_images" ON "questions_images"."question_id" = "questions"."question_id" LEFT JOIN "question_category_mapping" ON "questions"."question_id" = "question_category_mapping"."question_id" LEFT JOIN "users" AS "owner" ON "owner"."user_id" = "questions"."created_by" WHERE "questions"."is_deleted" = false AND questions.question_id =:id`;
      } else if (
        parseInt(requestData.get_comment_type) === GET_COMMENT_TYPE.SHARED_TYPE
      ) {
        query += ` SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video", "user_shared_questions"."question_id", "user_shared_questions"."question_shared_id", (SELECT  COALESCE(COUNT(*), 0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false) AS "shared_count", (SELECT COALESCE(COUNT(user_likes.question_shared_id), 0) FROM "user_likes" WHERE "user_likes"."question_shared_id"="user_shared_questions"."question_shared_id") AS likes_count, (SELECT COALESCE(COUNT(user_answers.answer_id), 0) FROM "user_answers" WHERE "user_answers"."question_id" = "questions"."question_id" ) AS "vote_count", (SELECT COALESCE(COUNT(user_comments.comment_id), 0) FROM user_comments WHERE user_comments.question_shared_id = user_shared_questions.question_shared_id AND user_comments.parent_id IS NULL AND user_comments.is_active = true AND user_comments.is_deleted = false AND user_comments.comment_id NOT IN(SELECT comment_id FROM reported_comments WHERE reported_by =:userId and comment_id is not null) AND user_comments.user_id NOT IN ${this.getBlockCondition()}) AS comment_count, (CASE WHEN (EXISTS (select from "user_likes" WHERE "user_likes"."user_id" =:userId AND "user_likes"."question_shared_id" = "user_shared_questions"."question_shared_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false)) THEN true ELSE false END) AS "is_liked", 
        (CASE WHEN (EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id" =:userId AND "user_shared_questions"."question_id" = "questions"."question_id" AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false)) THEN true ELSE false END) AS "is_shared",questions_images.image_url, questions_images.video_thumbnail, questions_images.video_url, questions.question_title, questions.answer_expiry_time, user_shared_questions.share_message, user_shared_questions.is_commenting_enabled,
        user_shared_questions.user_id, users.first_name, users.last_name, CONCAT(users.first_name,' ',users.last_name) AS full_name, users.profile_picture, users.user_name, users.is_business_account, users.is_officially_verified, question_category_mapping.category_id, null AS user_answer, user_shared_questions.created_at, questions_images.transcoded_video_url, questions_images.width,
        questions_images.height, questions_images.ratio, questions_images.question_cover_type, owner.profile_picture AS owner_profile_picture, owner.first_name AS owner_first_name, owner.last_name AS owner_last_name, owner.user_name AS owner_user_name, owner.is_business_account AS owner_is_business_account, owner.is_officially_verified AS owner_is_officially_verified, questions.created_at AS owner_post_create_time, questions.question_date AS question_date, CONCAT(owner.first_name,' ',owner.last_name) AS owner_full_name,(CASE WHEN owner.role =:adminRoleId THEN true ELSE false END) AS is_admin_question, owner.user_id AS owner_user_id FROM "user_shared_questions" LEFT JOIN "questions" USING("question_id") LEFT JOIN "questions_images" ON "questions_images"."question_id" = "questions"."question_id" LEFT JOIN "question_category_mapping" ON "questions"."question_id" = "question_category_mapping"."question_id" LEFT JOIN "users" ON "users"."user_id" = "user_shared_questions"."user_id" LEFT JOIN "users" AS "owner" ON "owner"."user_id" = "questions"."created_by" LEFT JOIN "user_follows" ON "user_follows"."followed_to" = "users"."user_id" WHERE user_shared_questions.user_id NOT IN ${this.getBlockCondition()} AND "user_shared_questions"."is_active" = true AND "user_shared_questions"."is_deleted" = false AND questions.is_deleted = false AND user_shared_questions.question_shared_id =:id`;
      }
      return await this.executeSelectRawQuery(query, {
        userId: userId,
        id: requestData.id,
        adminRoleId: String(ROLE_IDS.ADMIN),
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFilteredCommentsLists(requestData, userId) {
    try {
      let filterQuery = ``; //to filter on behalf of order_id
      let replyFilterQuery = ``; //to filter the individual reply
      let replyCommentQuery = ``; // to filter on behalf of order_id in reply
      let replyMentionedQuery = ``; // to filter the mentioned users data in case of individual query
      let auditObj = {};
      let questionFilterQuery = ``; //to filter on behalf of questions
      auditObj.user_id = userId;
      auditObj.id = uuidv4();
      if (
        parseInt(requestData.get_comment_type) ===
        GET_COMMENT_TYPE.QUESTION_TYPE
      ) {
        questionFilterQuery += ` user_comments.question_id=:id AND user_comments.question_shared_id IS NULL AND `;
        auditObj.question_id = requestData.id;
      } else if (
        parseInt(requestData.get_comment_type) === GET_COMMENT_TYPE.SHARED_TYPE
      ) {
        questionFilterQuery += ` user_comments.question_shared_id=:id AND `;
        auditObj.question_shared_id = requestData.id;
      }
      const getOrderIdData = await UserCommentsModel.findOne({
        where: { comment_id: requestData.comment_id },
        attributes: ["order_id"],
      });
      if (!getOrderIdData || !getOrderIdData.dataValues) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_COMMENT_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
      if (requestData.comment_id) {
        filterQuery += ` user_comments.order_id<=${+getOrderIdData.dataValues
          .order_id}`;
        replyCommentQuery += ` user_comments.order_id<=${+getOrderIdData
          .dataValues.order_id} AND`;
      }
      if (requestData.reply_comment_id) {
        replyFilterQuery += ` AND parent.comment_id='${requestData.reply_comment_id}'`;
        replyCommentQuery = ``;
        replyMentionedQuery += ` AND user_comments.comment_id='${requestData.reply_comment_id}'`;
      }
      const query = `SELECT(SELECT COUNT(user_comments.comment_id) FROM "user_comments"  WHERE ${questionFilterQuery} ${filterQuery} AND "user_comments"."parent_id" is null AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments"  WHERE (comment_id is not null) and  (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) ) AS total_count,(select array_agg('{ "user_id": ' || CONCAT('"',sq1.user_id,'"') || ', "user_name": ' || CONCAT('"',sq1.user_name,'"') ||',"comment_id": ' || CONCAT('"',sq1.comment_id,'"') || '}') AS "mentioned_user" FROM ( SELECT "user_comments"."comment_id","mentioned_users"."user_name","mentioned_users"."user_id","mentioned_users"."profile_picture" FROM "user_comments" INNER JOIN "users" USING ("user_id") INNER JOIN "user_comment_mentions" ON "user_comment_mentions"."comment_id"="user_comments"."comment_id" INNER JOIN "users" AS "mentioned_users" ON "mentioned_users"."user_id"="user_comment_mentions"."user_id"  WHERE ${questionFilterQuery} ${filterQuery} AND "user_comments"."parent_id" IS NULL AND "user_comment_mentions"."user_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) ) AS sq1) AS mentioned_users_data, 
      (select array_agg('{ "user_id": ' || CONCAT('"',sq3.user_id,'"') || ', "user_name": ' || CONCAT('"',sq3.user_name,'"') ||',"comment_id": ' || CONCAT('"',sq3.comment_id,'"') || '}') AS "mentioned_user_reply" FROM ( SELECT "user_comments"."comment_id","mentioned_users"."user_name","mentioned_users"."user_id","mentioned_users"."profile_picture" FROM "user_comments" INNER JOIN "users" USING ("user_id") INNER JOIN "user_comment_mentions" ON "user_comment_mentions"."comment_id"="user_comments"."comment_id" INNER JOIN "users" AS "mentioned_users" ON "mentioned_users"."user_id"="user_comment_mentions"."user_id"  WHERE  ${questionFilterQuery}  "user_comments"."parent_id" IS NOT NULL  ${replyMentionedQuery} AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND  "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) AND ((("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) UNION SELECT "user_comments"."comment_id","mentioned_users"."user_name","mentioned_users"."user_id","mentioned_users"."profile_picture" FROM "user_comments" INNER JOIN "users" USING ("user_id") INNER JOIN "user_comment_mentions" ON "user_comment_mentions"."comment_id"="user_comments"."comment_id" INNER JOIN "users" AS "mentioned_users" ON "mentioned_users"."user_id"="user_comment_mentions"."user_id"  WHERE  ${questionFilterQuery}  "user_comments"."parent_id" IS NOT NULL  AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND  "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) AND ((("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus)) AS sq3) AS reply_mentioned_users_data, 
      (select array_agg('{ "comment_id": ' || CONCAT('"',sq4.comment_id,'"') || ', "user_name": ' || CONCAT('"',sq4.user_name,'"') || ' ,"comment": ' || CONCAT('"',sq4.comment,'"') ||' , "profile_picture": ' || CONCAT('"',sq4.profile_picture,'"') ||',"parent_id": ' || CONCAT('"',sq4.parent_id,'"') ||', "user_id": ' || CONCAT('"',sq4.user_id,'"') || ',"created_at": ' || CONCAT('"',sq4.created_at,'"') || ' }') AS "reply_count_data" FROM (SELECT "parent"."comment_id",parent.comment,users.user_name,users.profile_picture,parent.parent_id,parent.user_id,parent.created_at FROM "user_comments" INNER JOIN "user_comments" AS "parent" ON "user_comments"."comment_id"="parent"."parent_id" AND "parent"."parent_id"="user_comments"."comment_id" INNER JOIN "users" ON "users"."user_id"="parent"."user_id"  WHERE ${replyCommentQuery}  ${questionFilterQuery}  "parent"."parent_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "parent"."is_active"=true AND "parent"."is_deleted"=false ${replyFilterQuery} AND "parent"."user_id" NOT IN ${this.getBlockCondition()} AND "parent"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) UNION SELECT "parent"."comment_id",parent.comment,users.user_name,users.profile_picture,parent.parent_id,parent.user_id,parent.created_at FROM "user_comments" INNER JOIN "user_comments" AS "parent" ON "user_comments"."comment_id"="parent"."parent_id" AND "parent"."parent_id"="user_comments"."comment_id" INNER JOIN "users" ON "users"."user_id"="parent"."user_id" WHERE ${replyCommentQuery}  ${questionFilterQuery}  "parent"."parent_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "parent"."is_active"=true AND "parent"."is_deleted"=false  AND "parent"."user_id" NOT IN ${this.getBlockCondition()} AND "parent"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) order by created_at desc ) as sq4 ) AS comment_reply_data, user_comments.comment_id,user_comments.created_at,user_comments.comment, 
      commented_users.user_name,commented_users.profile_picture,user_comments.user_id, (select array_agg('{ "comment_id": ' || CONCAT('"',sq2.comment_id,'"') || ', "count": ' || CONCAT('"',sq2.count,'"') || '}') AS "reply_count" FROM (SELECT COUNT(parent.parent_id) AS count,"user_comments"."comment_id" FROM "user_comments" LEFT JOIN "user_comments" AS "parent" ON "user_comments"."comment_id"="parent"."parent_id" AND "parent"."parent_id"="user_comments"."comment_id"  WHERE ${questionFilterQuery} ${filterQuery} AND "parent"."parent_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "parent"."is_active"=true AND "parent"."is_deleted"=false AND "parent"."user_id" NOT IN ${this.getBlockCondition()} GROUP BY "user_comments"."comment_id" ) AS sq2) AS comment_reply FROM user_comments INNER JOIN "users" AS "commented_users" ON "commented_users"."user_id"="user_comments"."user_id"  WHERE  ${questionFilterQuery} ("user_comments"."parent_id" IS NULL AND ${filterQuery} AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and  (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus)) ORDER BY user_comments.created_at DESC OFFSET :offset limit  :limit `;
      // await this.createAuditForCommentSilentPush(auditObj);
      return await this.executeSelectRawQuery(query, {
        id: requestData.id,
        offset: parseInt(requestData.offset),
        limit: parseInt(requestData.limit),
        userId: userId,
        reportStatus: REPORT_STATUS.PENDING,
        acceptedReportedStatus: REPORT_STATUS.ACCEPTED,
        rejectedReportedStatus: REPORT_STATUS.REJECTED,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getPreviousAndForwardCount(requestData, userId) {
    try {
      const getOrderIdData = await UserCommentsModel.findOne({
        where: { comment_id: requestData.reply_comment_id },
        attributes: ["order_id"],
      });
      if (!getOrderIdData || !getOrderIdData.dataValues) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_COMMENT_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
      const query = `SELECT COUNT(user_comments.comment_id) as count  FROM "user_comments" INNER JOIN "user_comments" AS "parent" ON "user_comments"."comment_id"="parent"."parent_id"   WHERE parent.order_id>:orderId and parent.parent_id is not null and parent.parent_id=:parentId and user_comments.is_deleted=false and parent.is_deleted=false and user_comments.is_active=true and parent.is_active=true AND "parent"."user_id" NOT IN ${this.getBlockCondition()} AND "parent"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) UNION ALL SELECT COUNT(user_comments.comment_id) as count  FROM "user_comments" INNER JOIN "user_comments" AS "parent" ON "user_comments"."comment_id"="parent"."parent_id"   WHERE parent.order_id<:orderId and parent.parent_id is not null and parent.parent_id=:parentId and user_comments.is_deleted=false and parent.is_deleted=false and user_comments.is_active=true and parent.is_active=true AND "parent"."user_id" NOT IN ${this.getBlockCondition()} AND "parent"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE (comment_id is not null) and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus)`;
      return await this.executeSelectRawQuery(query, {
        orderId: +getOrderIdData.dataValues.order_id,
        parentId: requestData.comment_id || requestData.parent_id,
        userId: userId,
        reportStatus: REPORT_STATUS.PENDING,
        acceptedReportedStatus: REPORT_STATUS.ACCEPTED,
        rejectedReportedStatus: REPORT_STATUS.REJECTED,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFilteredReplyCommentLists(requestData, userId) {
    try {
      const getOrderIdData = await UserCommentsModel.findOne({
        where: { comment_id: requestData.reply_comment_id },
        attributes: ["order_id"],
      });
      if (!getOrderIdData || !getOrderIdData.dataValues) {
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_COMMENT_ID,
          HTTP_CODES.BAD_REQUEST
        );
      }
      let filterQuery = ``;
      if (+requestData.scroll_type === REPLY_SCROLL_TYPE.NEXT) {
        filterQuery += ` AND user_comments.order_id>:orderId`;
      } else if (+requestData.scroll_type === REPLY_SCROLL_TYPE.PREVIOUS) {
        filterQuery += ` AND user_comments.order_id<:orderId`;
      }
      const query = `SELECT (SELECT COUNT(comment_id) FROM "user_comments"  WHERE "user_id" NOT IN ${this.getBlockCondition()} AND "parent_id"=:parentId ${filterQuery} AND "comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE comment_id is not null and  (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus) ) AS total_count,(select array_agg('{ "user_id": ' || CONCAT('"',sq1.user_id,'"') || ', "user_name": ' || CONCAT('"',sq1.user_name,'"') ||',"comment_id": ' || CONCAT('"',sq1.comment_id,'"') || '}') AS "mentioned_user" FROM ( SELECT "user_comments"."comment_id","mentioned_users"."user_name","mentioned_users"."user_id","mentioned_users"."profile_picture" FROM "user_comments" INNER JOIN "users" USING ("user_id") LEFT JOIN "user_comment_mentions" ON "user_comment_mentions"."comment_id"="user_comments"."comment_id" LEFT JOIN "users" AS "mentioned_users" ON "mentioned_users"."user_id"="user_comment_mentions"."user_id"  WHERE  "user_comments"."parent_id"=:parentId ${filterQuery} AND "user_comment_mentions"."user_id" IS NOT NULL AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN (SELECT "comment_id" FROM "reported_comments" WHERE comment_id is not null and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus)) AS sq1) AS mentioned_users_data, user_comments.comment_id,user_comments.created_at,user_comments.comment,commented_users.user_name,commented_users.profile_picture,user_comments.parent_id,user_comments.user_id FROM user_comments INNER JOIN "users" AS "commented_users" ON "commented_users"."user_id"="user_comments"."user_id"  WHERE "user_comments"."parent_id"=:parentId ${filterQuery} AND "user_comments"."is_deleted"=false AND "user_comments"."is_active"=true AND "user_comments"."user_id" NOT IN ${this.getBlockCondition()} AND "user_comments"."comment_id" NOT IN  (SELECT "comment_id" FROM "reported_comments" WHERE comment_id is not null and (("report_status"=:reportStatus or "report_status"=:rejectedReportedStatus) AND "reported_by"=:userId) OR "report_status"=:acceptedReportedStatus)  ORDER BY "user_comments"."created_at" DESC  limit  :limit`;
      return await this.executeSelectRawQuery(query, {
        parentId: requestData.parent_id,
        offset: parseInt(requestData.offset),
        limit: parseInt(requestData.limit),
        reportStatus: REPORT_STATUS.PENDING,
        userId: userId,
        acceptedReportedStatus: REPORT_STATUS.ACCEPTED,
        rejectedReportedStatus: REPORT_STATUS.REJECTED,
        orderId: +getOrderIdData.dataValues.order_id,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getAllReportedQuestionsMetaData() {
    try {
      const query = `SELECT questions.question_title,CONCAT(reported_user.first_name,' ',reported_user.last_name) AS reported_user_name,CONCAT(createor.first_name,' ',createor.last_name) AS creator_user_name,(CASE WHEN reported_questions.other_reason is not null THEN reported_questions.other_reason ELSE report_master.name END) AS report_reason,questions.question_id FROM reported_questions INNER JOIN questions ON questions.question_id=reported_questions.question_id INNER JOIN users as reported_user ON reported_user.user_id=reported_questions.reported_by INNER JOIN users as createor ON createor.user_id=questions.created_by LEFT JOIN report_master ON reported_questions.report_reason_id=report_master.id`;
      return await this.executeSelectRawQuery(query, {});
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getAllAdmin() {
    try {
      const query = `SELECT email FROM users where role=:roleId`;
      return await this.executeSelectRawQuery(query, {
        roleId: String(ROLE_IDS.ADMIN),
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getReportedPostMetaData(reportedPostId) {
    try {
      const query = `SELECT questions.question_title,CONCAT(reported_user.first_name,' ',reported_user.last_name) AS reported_user_name,CONCAT(createor.first_name,' ',createor.last_name) AS creator_user_name,(CASE WHEN reported_questions.other_reason is not null THEN reported_questions.other_reason ELSE report_master.name END) AS report_reason,questions.question_id FROM reported_questions INNER JOIN questions ON questions.question_id=reported_questions.question_id INNER JOIN users as reported_user ON reported_user.user_id=reported_questions.reported_by INNER JOIN users as createor ON createor.user_id=questions.created_by LEFT JOIN report_master ON reported_questions.report_reason_id=report_master.id WHERE reported_questions.id=:reportedPostId`;
      return await this.executeSelectRawQuery(query, {
        reportedPostId: reportedPostId,
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  // get question types master ..
  async getQuestionTypes() {
    try {
      const query = `SELECT * from question_type_master`;
      return await this.executeSelectRawQuery(query, {});
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async searchQuestion(requestData, userId, currentUserId) {
    try {
      return await require("../../elasticsearch/question").keywordSearch(
        currentUserId,
        {
          userId,
          keyword: requestData.search || "",
          categoryId: requestData.category_id,
        }
      );
    } catch (error) {
      Logger.error(new Error(error));
      throw error;
    }
  }

  //global search fgfor posts ..
  async searchQuestionGlobal(requestData, currentUserId) {
    try {
      return [];
    } catch (error) {
      Logger.error(new Error(error));
      throw new ErrorHandler().customError(
        ERROR_MESSSAGES.SEARCH_SERVICE_NOT_AVAILABLE,
        HTTP_CODES.BAD_REQUEST
      );
    }
  }

  async getReportedQuestionsData() {
    try {
      const query = `SELECT distinct question_id from reported_questions where report_status !=:rejected`;
      return await this.executeSelectRawQuery(query, {
        rejected: REPORT_STATUS.REJECTED,
      });
    } catch (error) {
      Logger.error(new Error(error));
    }
  }

  async getBlockedUsers() {
    try {
      const query = `select distinct question_id from questions where created_by in (select blocked_to as user_id from  user_blocks union select user_id from users where is_active = false);`;
      return await this.executeSelectRawQuery(query, {});
    } catch (error) {
      Logger.error(new Error(error));
    }
  }

  async saveSearchForRecommendation(requestData, userId) {
    try {
      const searchValue = requestData.search.trim();
      const searchData = await QuestionSearchSuggestions.findOne({
        where: {
          search: searchValue,
          user_id: userId,
        },
      });
      if (searchData) {
        await QuestionSearchSuggestions.update(
          { created_at: Date.now() },
          { where: { id: searchData.dataValues.id } }
        );
        return;
      } else {
        await QuestionSearchSuggestions.create({
          id: uuidv4(),
          user_id: userId,
          search: searchValue,
          created_at: Date.now(),
        });
      }
    } catch (error) {
      Logger.error(new Error(error));
    }
  }

  async getSearchSuggestions(requestData, userId) {
    try {
      return await QuestionSearchSuggestions.findAll({
        offset: 0,
        limit: 10,
        where: {
          user_id: userId,
        },
        order: [["created_at", "DESC"]],
      });
    } catch (error) {
      Logger.error(new Error(error));
    }
  }

  // get data from Db for global search ..
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
      let query = `SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video","questions"."question_id",null AS "question_shared_id",(SELECT COALESCE(COUNT(*),0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false) AS "shared_count",(SELECT COALESCE(COUNT(user_likes.question_id),0) FROM "user_likes" WHERE "user_likes"."question_shared_id" IS NULL AND "user_likes"."question_id"="questions"."question_id") AS "likes_count",(SELECT COALESCE(COUNT(user_answers.answer_id),0) FROM "user_answers" WHERE "user_answers"."question_id"="questions"."question_id" ) AS "vote_count",(SELECT COALESCE(COUNT(user_comments.comment_id),0) FROM user_comments WHERE user_comments.question_id=questions.question_id AND user_comments.parent_id IS NULL AND user_comments.is_active=true AND user_comments.is_deleted=false AND user_comments.question_shared_id is null AND user_comments.comment_id NOT IN(select comment_id FROM reported_comments where reported_by=:userId and comment_id is not null) AND user_comments.user_id NOT IN ${this.getBlockCondition(
        loggedInUser
      )}) AS comment_count, (CASE WHEN ( EXISTS (select from "user_likes" WHERE "user_likes"."user_id"=:loggedInUser AND "user_likes"."question_id"="questions"."question_id" AND "questions"."is_active"=true AND "questions"."is_deleted"=false AND user_likes.question_shared_id is null) ) THEN true ELSE false END ) AS "is_liked",(CASE WHEN ( EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id"=:loggedInUser AND "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false)) THEN true ELSE false END ) AS "is_shared",questions_images.image_url,questions.question_title,null AS share_message,questions.is_commenting_enabled,questions.created_by AS user_id,null AS first_name,null AS last_name,null as full_name,null as profile_picture,null as user_name, question_category_mapping.category_id,question_options.options AS user_answer,questions.created_at,questions_images.transcoded_video_url,questions_images.video_thumbnail,questions_images.width,questions_images.height,questions_images.ratio,
      owner.profile_picture AS owner_profile_picture,owner.first_name AS owner_first_name,owner.last_name AS owner_last_name,questions.created_at AS owner_post_create_time,CONCAT(owner.first_name,' ',owner.last_name) AS owner_full_name,(CASE WHEN owner.role=:adminRoleId THEN true ELSE false END) AS is_admin_question, (select questions_categories_master.category_name  as category_name from questions_categories_master inner join question_category_mapping on question_category_mapping.category_id = questions_categories_master.category_id where question_category_mapping.question_id = questions.question_id) as category_name, questions_images.question_cover_type,questions.answer_duration, questions.answer_expiry_time FROM "questions" INNER JOIN "questions_images" ON "questions_images"."question_id"="questions"."question_id" INNER JOIN "question_category_mapping" ON "questions"."question_id"="question_category_mapping"."question_id" LEFT JOIN "user_answers" ON "user_answers"."question_id"="questions"."question_id" LEFT JOIN "question_options" ON "question_options"."question_option_id"="user_answers"."answer_id" INNER JOIN "users" AS "owner" ON "owner"."user_id"="questions"."created_by" WHERE "questions"."is_active"=true AND "questions"."video_status" != 1 AND "questions"."is_deleted"=false AND questions.question_id NOT IN(SELECT question_id FROM reported_questions WHERE reported_by=:userId and question_id is not null) AND questions.created_by NOT IN(SELECT blocked_to FROM user_blocks WHERE blocked_by=:userId and blocked_to is not null) ${elasticIdQuery} UNION SELECT (CASE WHEN questions_images.transcoded_video_url IS NOT NULL THEN true ELSE false END) AS "is_video","user_shared_questions"."question_id", 
      "user_shared_questions"."question_shared_id",(SELECT COALESCE(COUNT(*),0) FROM "user_shared_questions" WHERE "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false) AS "shared_count",(SELECT COALESCE(COUNT(user_likes.question_shared_id),0) FROM "user_likes" WHERE "user_likes"."question_shared_id"="user_shared_questions"."question_shared_id" ) AS likes_count,(SELECT COALESCE(COUNT(user_answers.answer_id),0) FROM "user_answers" WHERE "user_answers"."question_id"="questions"."question_id" ) AS "vote_count",(SELECT COALESCE(COUNT(user_comments.comment_id),0) FROM user_comments WHERE user_comments.question_shared_id=user_shared_questions.question_shared_id AND user_comments.parent_id IS NULL AND user_comments.is_active=true AND user_comments.is_deleted=false AND user_comments.comment_id NOT IN(SELECT comment_id FROM reported_comments WHERE reported_by=:userId and comment_id is not null) AND user_comments.user_id NOT IN ${this.getBlockCondition(
        loggedInUser
      )} ) AS comment_count,
      (CASE WHEN ( EXISTS (select from "user_likes" WHERE "user_likes"."user_id"=:loggedInUser AND "user_likes"."question_shared_id"="user_shared_questions"."question_shared_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false) ) THEN true ELSE false END ) AS "is_liked", (CASE WHEN ( EXISTS (SELECT FROM "user_shared_questions" WHERE "user_shared_questions"."user_id"=:loggedInUser AND "user_shared_questions"."question_id"="questions"."question_id" AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false)) THEN true ELSE false END ) AS "is_shared",questions_images.image_url,questions.question_title,user_shared_questions.share_message,user_shared_questions.is_commenting_enabled,user_shared_questions.user_id,users.first_name,users.last_name,CONCAT(users.first_name,' ',users.last_name) AS full_name,users.profile_picture,users.user_name,question_category_mapping.category_id,question_options.options AS user_answer,user_shared_questions.created_at,questions_images.transcoded_video_url,questions_images.video_thumbnail,questions_images.width,questions_images.height,questions_images.ratio,owner.profile_picture AS owner_profile_picture,owner.first_name AS owner_first_name,owner.last_name AS owner_last_name,questions.created_at AS owner_post_create_time,CONCAT(owner.first_name,' ',owner.last_name) AS owner_full_name,(CASE WHEN owner.role=:adminRoleId THEN true ELSE false END) AS is_admin_question,owner.user_id AS owner_user_id, (select questions_categories_master.category_name  as category_name from questions_categories_master inner join question_category_mapping on question_category_mapping.category_id = questions_categories_master.category_id 
      where question_category_mapping.question_id = questions.question_id) as category_name, questions_images.question_cover_type,questions.answer_duration,questions.answer_expiry_time FROM "user_shared_questions" INNER JOIN "questions" USING("question_id") INNER JOIN "questions_images" ON "questions_images"."question_id"="questions"."question_id" INNER JOIN "question_category_mapping" ON "questions"."question_id"="question_category_mapping"."question_id" LEFT JOIN "user_answers" ON "user_answers"."question_id"="user_shared_questions"."question_id" LEFT JOIN "question_options" ON "question_options"."question_option_id"="user_answers"."answer_id" INNER JOIN "users" ON "users"."user_id"="user_shared_questions"."user_id" INNER JOIN "users" AS "owner" ON "owner"."user_id"="questions"."created_by" WHERE user_shared_questions.user_id NOT IN ${this.getBlockCondition(
        loggedInUser
      )} AND "user_shared_questions"."is_active"=true AND "user_shared_questions"."is_deleted"=false AND questions.is_active=true AND questions.video_status != 1 AND questions.is_deleted=false AND user_shared_questions.question_shared_id NOT IN (SELECT question_shared_id FROM reported_questions WHERE reported_by=:userId AND question_shared_id is not null) ${easticSharedQuery}`;
      let countQuery = `SELECT COUNT(*) FROM (${query}) AS count_query`;
      query += ` ORDER BY created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
      replacements.page_number = parseInt(requestData.page_number);
      replacements.limit = parseInt(requestData.limit);
      replacements.userId = loggedInUser;
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

  // get question comment data
  async getQuestionCommentData(requestData, userId, questionCommentData) {
    try {
      let userSharedQuestionModel;
      //#region working on to change response
      let questionDetails = {};
      if (questionCommentData && questionCommentData.length) {
        const categoryName = await CategoryMasterModel.findOne({
          where: { category_id: questionCommentData[0].category_id },
          attributes: ["category_name"],
        });
        if (
          parseInt(requestData.get_comment_type) ===
          GET_COMMENT_TYPE.SHARED_TYPE
        ) {
          userSharedQuestionModel = await UserSharedQuestionModel.findOne({
            where: {
              // user_id: userId,
              question_shared_id: requestData.id,
              is_active: true,
              is_deleted: false,
            },
            attributes: [
              "question_shared_id",
              "user_id",
              "share_message",
              "created_at",
              "question_id",
            ],
          });
        }
        let sharedByUser = null;
        if (userSharedQuestionModel) {
          const findUser = await UserModel.findOne({
            where: {
              user_id: userSharedQuestionModel.dataValues.user_id,
            },
          });
          if (findUser) {
            sharedByUser = {
              id: findUser.user_id,
              firstName: findUser.first_name,
              lastName: findUser.last_name,
              username: findUser.user_name,
              isBusinessAccount: findUser.is_business_account,
              isVerified: findUser.is_officially_verified,
              profilePicture: findUser.profile_picture,
            };
          }
        }
        questionDetails = {
          author: {
            id: questionCommentData[0].owner_user_id,
            firstName: questionCommentData[0].owner_first_name,
            lastName: questionCommentData[0].owner_last_name,
            username: questionCommentData[0].owner_user_name,
            profilePicture: questionCommentData[0].owner_profile_picture,
            isBusinessAccount: questionCommentData[0].owner_is_business_account,
            isVerified: questionCommentData[0].owner_is_officially_verified,
          },
          category: {
            id: questionCommentData[0].category_id,
            name: categoryName && categoryName.dataValues.category_name,
          },
          commentsCount: Number(questionCommentData[0].comment_count),
          createdAt: parseInt(questionCommentData[0].owner_post_create_time / 1000),
          expiryAt: parseInt(questionCommentData[0].answer_expiry_time / 1000),
          hashTags: [], //pending
          id: questionCommentData[0].question_id,
          isAdminQuestion: questionCommentData[0].is_admin_question,
          isCommentingEnabled: questionCommentData[0].is_commenting_enabled,
          likesCount: Number(questionCommentData[0].likes_count),
          sharesCount: Number(questionCommentData[0].shared_count),
          media: {
            height: questionCommentData[0].height,
            width: questionCommentData[0].width,
            imageUrl: questionCommentData[0].image_url,
            questionCoverType: questionCommentData[0].question_cover_type,
            ratio: questionCommentData[0].ratio,
            transcodedVideoUrl: questionCommentData[0].transcoded_video_url,
            videoThumbnail: questionCommentData[0].video_thumbnail,
            videoUrl: questionCommentData[0].video_url,
          },
          myLikeStatus: questionCommentData[0].is_liked,
          myVoteStatus: questionCommentData[0].myVoteStatus,
          questionAt: parseInt(questionCommentData[0].question_date / 1000),
          title: questionCommentData[0].question_title,
          type: Number(requestData.get_comment_type),
          votesCount: Number(questionCommentData[0].vote_count),
        };
        if (
          parseInt(requestData.get_comment_type) ===
          GET_COMMENT_TYPE.SHARED_TYPE
        ) {
          questionDetails["sharedAt"] = parseInt(
            questionCommentData[0].created_at / 1000
          );
          questionDetails["sharedBy"] = sharedByUser;
          questionDetails["sharedMessage"] = userSharedQuestionModel
            ? userSharedQuestionModel.share_message
            : null;
          questionDetails["sharedQuestionId"] = userSharedQuestionModel
            ? userSharedQuestionModel.question_shared_id
            : null;
        }
      }
      //#endregion
      return questionDetails;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async increaseCommentCountInES(questionId) {
    await ESQuestion.incrementCommentCount(questionId, 1);
  }

  async descreaseCommentCountInES(questionId) {
    await ESQuestion.decrementCommentCount(questionId, 1);
  }

  async increaseLikeCountInES(questionId) {
    await ESQuestion.incrementLikeCount(questionId, 1);
  }

  async descreaseLikeCountInES(questionId) {
    await ESQuestion.decrementLikeCount(questionId, 1);
  }

  async increaseShareCountInES(questionId) {
    await ESQuestion.incrementShareCount(questionId, 1);
  }

  async descreaseShareCountInES(questionId) {
    await ESQuestion.decrementShareCount(questionId, 1);
  }

  async increaseVoteCountInES(questionId) {
    await ESQuestion.incrementVoteCount(questionId, 1);
  }

  async descreaseVoteCountInES(questionId) {
    await ESQuestion.decrementVoteCount(questionId, 1);
  }

  async increaseCommentCountInESPost(questionId) {
    await ESQuestion.incrementCommentCountPost(questionId, 1);
  }

  async descreaseCommentCountInESPost(questionId) {
    await ESQuestion.decrementCommentCountPost(questionId, 1);
  }

  async increaseLikeCountInESPost(questionId) {
    await ESQuestion.incrementLikeCountPost(questionId, 1);
  }

  async descreaseLikeCountInESPost(questionId) {
    await ESQuestion.decrementLikeCountPost(questionId, 1);
  }

  async increaseShareCountInESPost(questionId) {
    await ESQuestion.incrementShareCountPost(questionId, 1);
  }

  async descreaseShareCountInESPost(questionId) {
    await ESQuestion.decrementShareCountPost(questionId, 1);
  }

  /**
   * Deleting question and related post from Postgres and ES
   * @param {*} question_id 
   * @returns 
   */
  async deleteQuestionAndRelatedPost(question_id) {
    try {
      const queryQuestions = `UPDATE questions SET is_active = false, is_deleted = true, deleted_at = ${moment().valueOf()} where question_id = :question_id`;
      await this.executeSelectRawQuery(queryQuestions, { question_id });
      const querySharedQuestions = `UPDATE user_shared_questions SET is_active = false, is_deleted = true, deleted_at = ${moment().valueOf()} where question_id = :question_id`;
      await this.executeSelectRawQuery(querySharedQuestions, { question_id });
      await ESQuestion.deleteQuestionsAndRelatedPost(question_id, {});
      return;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  /**
   * Deleting shared post post from Postgres and ES
   * @param {*} question_id 
   * @returns 
   */
  async deleteSharedPosts(question_shared_id) {
    try {
      const querySharedQuestions = `UPDATE user_shared_questions SET is_active = false, is_deleted = true, deleted_at = ${moment().valueOf()} where question_shared_id = :question_shared_id`;
      await this.executeSelectRawQuery(querySharedQuestions, { question_shared_id });
      ESQuestion.deleteDoc(question_shared_id, () => {
        return;
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }
}

// (async () => {
//  await ThresholdMasterModel.destroy({ where: { type: THRESHOLD_TYPE.GROUP_MENTIONED_USERS } });
//     await ThresholdMasterModel.create({
//         id: uuidv4(),
//         threshold_count: 5,
//         type: THRESHOLD_TYPE.REPORT_POST
//     })
//     await ThresholdMasterModel.create({
//         id: uuidv4(),
//         threshold_count: 2,
//         type: THRESHOLD_TYPE.REPORT_COMMENT
//     })
//     await ThresholdMasterModel.create({
//         id: uuidv4(),
//         threshold_count: 2,
//         type: THRESHOLD_TYPE.GROUP_COMMENTS
//     })
//     await ThresholdMasterModel.create({
//         id: uuidv4(),
//         threshold_count: 2,
//         type: THRESHOLD_TYPE.GROUP_LIKES
//     })
// await ThresholdMasterModel.create({
//     id: uuidv4(),
//     threshold_count: 2,
//     type: THRESHOLD_TYPE.GROUP_MENTIONED_USERS
// })
// await ThresholdTrendingMasterModel.destroy({ where: {} });
// await ThresholdTrendingMasterModel.create({
//     id: uuidv4(),
//     threshold_count: 2,
//     type: TRENDING_THRESHOLD_TYPE.VOTE_COUNT
// })
// })()

module.exports = QuestionRepository;
