const QuestionRepository = require("./QuestionRepository");
const { v4: uuidv4 } = require("uuid");
const { HTTP_CODES, ERROR_MESSSAGES } = require("../../utils/Constants");
const ErrorHandler = require("../../helpers/ErrorHandler");
const CommonFunctions = require("../../utils/CommonFunctions");
const Logger = require("../../helpers/Logger");
const SendGrid = require("../../helpers/SendGrid");
const { createLink } = require("../../helpers/FireBaseFunctions");
const { GET_COMMENT_TYPE } = require("../../utils/Constants");
const {
  sendSilentPushNotificationOnComment,
  sendSilentPushNotificationForCountUpdate,
  likePostNotifications,
  commentPostNotifications,
  commentReplyPostNotifications,
} = require("../Questions/NotificationServices");
const { NOTIFICATION_TYPE } = require("../../utils/NoitificationConstants");
const {
  UserAnswersModel,
  UserSharedQuestionModel
} = require("../../models");

class QuestionServices {
  constructor() {
    this.QuestionRepositoryObj = new QuestionRepository();
  }

  async enableDisableCommentService(requestData, userId) {
    try {
      let data;
      if (GET_COMMENT_TYPE.QUESTION_TYPE === parseInt(requestData.type))
        data = await this.QuestionRepositoryObj.enableDisableCommenting(
          requestData,
          userId
        );
      else if (GET_COMMENT_TYPE.SHARED_TYPE === parseInt(requestData.type))
        data =
          await this.QuestionRepositoryObj.enableDisableCommentingOfSharedQuestion(
            requestData,
            userId
          );
      if (data && data.length && data[0]) return;
      else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.INVALID_QUESTION_ID,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createCommentService(requestData, userId) {
    try {
      let mentionedUsersArray = [];
      const data = await this.QuestionRepositoryObj.createComment(
        requestData,
        userId
      );
      const commentListData =
        await this.QuestionRepositoryObj.getCommentDetailsAfterAddition(data);
      requestData.question_shared_id
        ? await this.QuestionRepositoryObj.increaseCommentCountInESPost(
          requestData.question_shared_id
        )
        : await this.QuestionRepositoryObj.increaseCommentCountInES(
          requestData.question_id
        );
      if (commentListData.length) {
        if (
          commentListData[0].mentioned_users_data &&
          commentListData[0].mentioned_users_data.length
        )
          commentListData[0].mentioned_users_data.forEach((x) => {
            mentionedUsersArray.push(CommonFunctions.parseJsonFuncton(x));
          });
        let commentData = {};
        commentData = {
          mentioned_users: mentionedUsersArray,
          comment_id: commentListData[0].comment_id,
          created_at: commentListData[0].created_at,
          comment: commentListData[0].comment,
          reply_count: commentListData[0].reply_count,
          user_name: commentListData[0].user_name,
          profile_picture: commentListData[0].profile_picture,
          user_id: commentListData[0].user_id,
          type: NOTIFICATION_TYPE.COMMENT_SILENT_PUSH,
          parent_id: requestData.parent_id || null,
          push_user_id: userId,
          parent_comment_id: requestData.parent_id || null,
        };
        //  commentPostNotifications(commentData);
        sendSilentPushNotificationOnComment(
          {
            question_shared_id: requestData.question_shared_id || null,
            question_id: requestData.question_id,
          },
          commentData
        );
        sendSilentPushNotificationForCountUpdate(
          {
            question_shared_id: requestData.question_shared_id || null,
            question_id: requestData.question_id,
          },
          commentData
        );
        if (commentData.parent_id)
          commentReplyPostNotifications(
            {
              ...commentData,
              ...{ question_id: requestData.question_id },
              ...{ question_shared_id: requestData.question_shared_id },
            },
            userId
          );
        else
          commentPostNotifications({
            ...commentData,
            ...{ question_id: requestData.question_id },
            ...{ question_shared_id: requestData.question_shared_id },
          });
        return commentData;
      } else return {};
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getCommentListService(requestData, userId) {
    try {
      let resultArray = [];
      let mentionedUsersArray = [];
      let commentReplyCount = [];
      let commentReplyData = [];
      let mentionedUsersReplyArray = [];
      let answerData;
      const [commentListData, questionMetaData] = await Promise.all([
        this.QuestionRepositoryObj.getCommentsLists(requestData, userId),
        this.QuestionRepositoryObj.getQuestionMetaData(requestData, userId),
      ]);
      if (GET_COMMENT_TYPE.QUESTION_TYPE === parseInt(requestData.get_comment_type)) {
        answerData = await UserAnswersModel.findOne({
          where: {
            question_id: requestData.id
          }
        })
      } else if (GET_COMMENT_TYPE.SHARED_TYPE === parseInt(requestData.get_comment_type)) {
        answerData = await UserSharedQuestionModel.findOne({
          where: {
            question_shared_id: requestData.id
          }
        })
      }

      questionMetaData.length && (questionMetaData[0].myVoteStatus = answerData ? true : false);
      const questionDetails = await this.QuestionRepositoryObj.getQuestionCommentData(
        requestData,
        userId,
        questionMetaData
      );

      if (commentListData && commentListData.length) {
        if (
          commentListData[0].mentioned_users_data &&
          commentListData[0].mentioned_users_data.length
        )
          commentListData[0].mentioned_users_data.forEach((x) => {
            mentionedUsersArray.push(CommonFunctions.parseJsonFuncton(x));
          });
        if (
          commentListData[0].comment_reply_data &&
          commentListData[0].comment_reply_data.length
        ) {
          commentListData[0].comment_reply_data.forEach((x) => {
            commentReplyData.push(CommonFunctions.parseJsonFuncton(x));
          });
        }
        if (
          commentListData[0].reply_mentioned_users_data &&
          commentListData[0].reply_mentioned_users_data.length
        )
          commentListData[0].reply_mentioned_users_data.forEach((x) => {
            mentionedUsersReplyArray.push(CommonFunctions.parseJsonFuncton(x));
          });
        if (
          commentListData[0].comment_reply &&
          commentListData[0].comment_reply.length
        )
          commentListData[0].comment_reply.forEach((x) => {
            commentReplyCount.push(CommonFunctions.parseJsonFuncton(x));
          });
        for (let x of commentListData) {
          x.replyCount = 0;
          for (let y of commentReplyCount) {
            if (y.comment_id === x.comment_id) {
              x.replyCount = y.count;
              break;
            }
          }
          const mentionedFriends = mentionedUsersArray.filter(
            (z) => z.comment_id === x.comment_id
          );
          let replyData = commentReplyData.filter(
            (z) => z.parent_id === x.comment_id
          );
          if (replyData.length) {
            replyData = replyData.slice(0, 3);
            for (let y of replyData) {
              y.reply_mentioned_users = mentionedUsersReplyArray.filter(
                (z) => z.comment_id === y.comment_id
              );
            }
          }
          resultArray.push({
            user_id: x.user_id,
            comment_id: x.comment_id,
            created_at: x.created_at,
            comment: x.comment,
            mentioned_users:
              mentionedFriends && mentionedFriends.length
                ? mentionedFriends
                : [],
            reply_count: x.replyCount,
            user_name: x.user_name,
            profile_picture: x.profile_picture,
            reply_data: { reply_list_data: replyData },
            previous_count: 0,
            next_count: 0,
          });
        }
        return {
          total_count: commentListData[0].total_count,
          list_data: resultArray,
          question_detail: questionDetails,
        };
      } else
        return {
          total_count: 0,
          list_data: [],
          question_detail: questionDetails,
        };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getReplyCommentListService(requestData, userId) {
    try {
      let resultArray = [];
      let mentionedUsersArray = [];
      const commentListData =
        await this.QuestionRepositoryObj.getReplyCommentLists(
          requestData,
          userId
        );
      if (commentListData && commentListData.length) {
        if (
          commentListData[0].mentioned_users_data &&
          commentListData[0].mentioned_users_data.length
        )
          commentListData[0].mentioned_users_data.forEach((x) => {
            mentionedUsersArray.push(CommonFunctions.parseJsonFuncton(x));
          });
        for (const x of commentListData) {
          const mentionedFriends = mentionedUsersArray.filter(
            (z) => z.comment_id === x.comment_id
          );
          resultArray.push({
            user_id: x.user_id,
            comment_id: x.comment_id,
            created_at: x.created_at,
            comment: x.comment,
            mentioned_users:
              mentionedFriends && mentionedFriends.length
                ? mentionedFriends
                : [],
            user_name: x.user_name,
            profile_picture: x.profile_picture,
            next_count: 0,
            previous_count: 0,
          });
        }
        return {
          total_count: commentListData[0].total_count,
          list_data: resultArray,
        };
      } else return { total_count: 0, list_data: [] };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async mentionUsersServices(requestData, userId) {
    try {
      const data = await this.QuestionRepositoryObj.mentionUsers(
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

  async deleteCommentService(requestData, userId) {
    try {
      // const data = await this.QuestionRepositoryObj.getCommentDetails(requestData, userId);
      // if (data && data.length) {
      //     if (data[0].is_deleted)
      //         throw new ErrorHandler().customError(ERROR_MESSSAGES.COMMENT_ALREADY_DELETED, HTTP_CODES.BAD_REQUEST);
      //     else if (data[0].created_by === userId || data[0].comment_user_id === userId || data[0].shared_user_id === userId) {
      requestData.question_shared_id
        ? await this.QuestionRepositoryObj.descreaseCommentCountInESPost(
          requestData.question_shared_id
        )
        : await this.QuestionRepositoryObj.descreaseCommentCountInES(
          requestData.question_id
        );
      return await this.QuestionRepositoryObj.updateCommentDetails(
        { is_deleted: true },
        requestData
      );
      // }
      // else
      //     throw new ErrorHandler().customError(ERROR_MESSSAGES.COMMENT_NOT_BELONGS, HTTP_CODES.BAD_REQUEST);
      // }
      // else
      //     throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_COMMENT_QUESTION_ID, HTTP_CODES.BAD_REQUEST);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createDynamicLinkService(requestData) {
    try {
      const data = await this.QuestionRepositoryObj.getQuestionData(
        requestData
      );
      if (data && data.dataValues) {
        const linkData = await createLink(data.dataValues);
        if (linkData)
          return typeof linkData === "string" ? JSON.parse(linkData) : linkData;
        else
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.UNVABLE_TO_CREATE_LINK,
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

  async likePostService(requestData, userId) {
    try {
      requestData.userId = userId;
      if (!requestData.question_shared_id && requestData.question_id) {
        const checkData =
          await this.QuestionRepositoryObj.checkIfAlreadyLikesThePost(
            requestData,
            userId
          );
        if (checkData && checkData.dataValues)
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.ALREADY_LIKED,
            HTTP_CODES.BAD_REQUEST
          );
      }
      requestData.question_shared_id
        ? await this.QuestionRepositoryObj.increaseLikeCountInESPost(
          requestData.question_shared_id
        )
        : await this.QuestionRepositoryObj.increaseLikeCountInES(
          requestData.question_id
        );
      await this.QuestionRepositoryObj.likePost({
        id: uuidv4(),
        user_id: userId,
        question_id: requestData.question_id,
        created_at: Date.now(),
        question_shared_id: requestData.question_shared_id || null,
      });
      const likesCount = requestData.question_shared_id
        ? await this.QuestionRepositoryObj.getTotalLikesOnPost(
          requestData.question_shared_id
        )
        : await this.QuestionRepositoryObj.getTotalLikesOnPost(
          requestData.question_shared_id,
          requestData.question_id
        );
      if (likesCount && likesCount.length) {
        likePostNotifications(requestData);
        sendSilentPushNotificationForCountUpdate(
          {
            question_shared_id: requestData.question_shared_id || null,
            question_id: requestData.question_id,
          },
          { push_user_id: userId }
        );
        return { likes_count: likesCount[0].count };
      } else {
        return { likes_count: 0 };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async dislikePostService(requestData, userId) {
    try {
      await this.QuestionRepositoryObj.disLikePost({
        user_id: userId,
        question_id: requestData.question_id,
        question_shared_id: requestData.question_shared_id || null,
      });
      const likesCount = requestData.question_shared_id
        ? await this.QuestionRepositoryObj.getTotalLikesOnPost(
          requestData.question_shared_id
        )
        : await this.QuestionRepositoryObj.getTotalLikesOnPost(
          requestData.question_shared_id,
          requestData.question_id
        );
      requestData.question_shared_id
        ? await this.QuestionRepositoryObj.descreaseLikeCountInESPost(
          requestData.question_shared_id
        )
        : await this.QuestionRepositoryObj.descreaseLikeCountInES(
          requestData.question_id
        );
      if (likesCount && likesCount.length) {
        sendSilentPushNotificationForCountUpdate(
          {
            question_shared_id: requestData.question_shared_id || null,
            question_id: requestData.question_id,
          },
          { push_user_id: userId }
        );
        return { likes_count: likesCount[0].count };
      } else {
        sendSilentPushNotificationForCountUpdate(
          {
            question_shared_id: requestData.question_shared_id || null,
            question_id: requestData.question_id,
          },
          { push_user_id: userId }
        );
        return { likes_count: 0 };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getTrendingQuestionService(requestData, userId) {
    try {
      const data = await this.QuestionRepositoryObj.getTrendingQuestions(
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

  async deleteFromSilentPushAuditService(requestData, userId) {
    try {
      return await this.QuestionRepositoryObj.deleteAuditForCommentSilentPush(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getReportReasonService(req) {
    try {
      return await this.QuestionRepositoryObj.getReportReasons(req);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async reportCommentService(requestData, userId) {
    try {
      const data = await this.QuestionRepositoryObj.getCommentDetails(
        requestData,
        userId,
        true
      );
      if (data && data.length) {
        // if (data[0].is_deleted)
        //     throw new ErrorHandler().customError(ERROR_MESSSAGES.COMMENT_ALREADY_DELETED, HTTP_CODES.//BAD_REQUEST);
        // else if (data[0].report_status)
        //     throw new ErrorHandler().customError(ERROR_MESSSAGES.ALREADY_REPORTED_COMMENT, HTTP_CODES.BAD_REQUEST);
        // else if (data[0].comment_user_id === userId)
        //     throw new ErrorHandler().customError(ERROR_MESSSAGES.CANNOT_REPORT_OWN_COMMENT, HTTP_CODES.//BAD_REQUEST)
      }
      requestData.id = uuidv4();
      requestData.reported_by = userId;
      requestData.created_at = Date.now();
      requestData.report_reason_id = requestData.report_reason_id || null;
      requestData.other_reason = requestData.other_reason || null;
      requestData.question_shared_id = requestData.question_shared_id || null;
      requestData.question_id = requestData.question_id || null;
      return await this.QuestionRepositoryObj.reportComment(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getCountyStateMasterService() {
    try {
      return await this.QuestionRepositoryObj.getStateAndCountyMaster();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async updateCountyStateMasterData() {
    try {
      return await this.QuestionRepositoryObj.updateMasterAndCounty();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getMapDataService(requestData) {
    try {
      const data = await this.QuestionRepositoryObj.getMapData(requestData);
      if (data && data.length) {
        for (const x of data) {
          x.options = x.options.filter(
            (xx) => xx.question_id === requestData.question_id
          );
          for (const y of x.state_data) {
            y.data = y.data.filter(
              (xx) => xx.question_id === requestData.question_id
            );
          }
        }
        return data;
      } else return [];
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getMapDataListService(requestData) {
    try {
      return await this.getMapDataService(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async reportPostService(requestData, userId) {
    try {
      if (
        !(await this.QuestionRepositoryObj.checkIfAlreadyReportedPost(
          requestData,
          userId
        ))
      ) {
        const data = await this.QuestionRepositoryObj.reportPost(
          requestData,
          userId
        );
        if (data && data.dataValues) {
          const [adminMetaData, reportedPostMetaData] = await Promise.all([
            this.QuestionRepositoryObj.getAllAdmin(),
            this.QuestionRepositoryObj.getReportedPostMetaData(
              data.dataValues.id
            ),
          ]);
          if (
            adminMetaData &&
            adminMetaData.length &&
            reportedPostMetaData &&
            reportedPostMetaData.length
          ) {
            const reportMetaDataObj = {
              userName: reportedPostMetaData[0].reported_user_name,
              questionTitle: reportedPostMetaData[0].question_title,
              createdBy: reportedPostMetaData[0].creator_user_name,
              reportReason: reportedPostMetaData[0].report_reason,
              link: `${process.env.REPORT_QUESTION_URL}${reportedPostMetaData[0].question_id}`,
            };
            for (const x of adminMetaData) {
              const sendGridMailData = {
                templateId: process.env.REPORT_QUESTION_TEMPLATE_ID,
                templateData: reportMetaDataObj,
                toEmail: x.email,
              };
              new SendGrid().sendMail(sendGridMailData);
            }
          }
        }
        return data;
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.ALREADY_REPORTED_POST,
          HTTP_CODES.BAD_REQUEST
        );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFilteredCommentListService(requestData, userId) {
    try {
      let resultArray = [];
      let mentionedUsersArray = [];
      let commentReplyCount = [];
      let commentReplyData = [];
      let mentionedUsersReplyArray = [];
      let answerData;
      let getForWardbackData;
      if (requestData.reply_comment_id) {
        getForWardbackData =
          await this.QuestionRepositoryObj.getPreviousAndForwardCount(
            requestData,
            userId
          );
      }
      const [commentListData, questionMetaData] = await Promise.all([
        this.QuestionRepositoryObj.getFilteredCommentsLists(
          requestData,
          userId
        ),
        this.QuestionRepositoryObj.getQuestionMetaData(requestData, userId),
      ]);
      if (GET_COMMENT_TYPE.QUESTION_TYPE === parseInt(requestData.get_comment_type)) {
        answerData = await UserAnswersModel.findOne({
          where: {
            question_id: requestData.id
          }
        })
      } else if (GET_COMMENT_TYPE.SHARED_TYPE === parseInt(requestData.get_comment_type)) {
        answerData = await UserSharedQuestionModel.findOne({
          where: {
            question_shared_id: requestData.id
          }
        })
      }
      Array.isArray(questionMetaData) && questionMetaData.length && (questionMetaData[0].myVoteStatus = answerData ? true : false)
      const questionDetails = await this.QuestionRepositoryObj.getQuestionCommentData(
        requestData,
        userId,
        questionMetaData
      );
      if (commentListData && commentListData.length) {
        if (
          commentListData[0].mentioned_users_data &&
          commentListData[0].mentioned_users_data.length
        )
          commentListData[0].mentioned_users_data.forEach((x) => {
            mentionedUsersArray.push(CommonFunctions.parseJsonFuncton(x));
          });
        if (
          commentListData[0].comment_reply_data &&
          commentListData[0].comment_reply_data.length
        ) {
          commentListData[0].comment_reply_data.forEach((x) => {
            commentReplyData.push(CommonFunctions.parseJsonFuncton(x));
          });
        }
        if (
          commentListData[0].reply_mentioned_users_data &&
          commentListData[0].reply_mentioned_users_data.length
        )
          commentListData[0].reply_mentioned_users_data.forEach((x) => {
            mentionedUsersReplyArray.push(CommonFunctions.parseJsonFuncton(x));
          });
        if (
          commentListData[0].comment_reply &&
          commentListData[0].comment_reply.length
        )
          commentListData[0].comment_reply.forEach((x) => {
            commentReplyCount.push(CommonFunctions.parseJsonFuncton(x));
          });
        for (let x of commentListData) {
          x.replyCount = 0;
          for (let y of commentReplyCount) {
            if (y.comment_id === x.comment_id) {
              x.replyCount = y.count;
              break;
            }
          }
          const mentionedFriends = mentionedUsersArray.filter(
            (z) => z.comment_id === x.comment_id
          );
          let replyData = commentReplyData.filter(
            (z) => z.parent_id === x.comment_id
          );
          if (replyData.length) {
            replyData = replyData.slice(0, 3);
            for (let y of replyData) {
              y.reply_mentioned_users = mentionedUsersReplyArray.filter(
                (z) => z.comment_id === y.comment_id
              );
            }
          }
          resultArray.push({
            user_id: x.user_id,
            comment_id: x.comment_id,
            created_at: x.created_at,
            comment: x.comment,
            mentioned_users:
              mentionedFriends && mentionedFriends.length
                ? mentionedFriends
                : [],
            reply_count: x.replyCount,
            user_name: x.user_name,
            profile_picture: x.profile_picture,
            reply_data: { reply_list_data: replyData },
            previous_count: 0,
            next_count: 0,
          });
        }
        return {
          total_count: commentListData[0].total_count,
          list_data: resultArray,
          question_detail: questionDetails,
        };
      } else
        return {
          total_count: 0,
          list_data: [],
          question_detail: questionDetails,
        };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getFilteredReplyCommentListService(requestData, userId) {
    try {
      let resultArray = [];
      let mentionedUsersArray = [];
      let getForWardbackData;
      if (requestData.reply_comment_id) {
        getForWardbackData =
          await this.QuestionRepositoryObj.getPreviousAndForwardCount(
            requestData,
            userId
          );
      }
      const commentListData =
        await this.QuestionRepositoryObj.getFilteredReplyCommentLists(
          requestData,
          userId
        );
      if (commentListData && commentListData.length) {
        if (
          commentListData[0].mentioned_users_data &&
          commentListData[0].mentioned_users_data.length
        )
          commentListData[0].mentioned_users_data.forEach((x) => {
            mentionedUsersArray.push(CommonFunctions.parseJsonFuncton(x));
          });
        for (const x of commentListData) {
          if (x.comment_id === requestData.reply_comment_id) {
            x.previous_count = getForWardbackData[0].count || 0;
            x.next_count = getForWardbackData[1].count || 0;
          } else {
            x.previous_count = 0;
            x.next_count = 0;
          }
          const mentionedFriends = mentionedUsersArray.filter(
            (z) => z.comment_id === x.comment_id
          );
          resultArray.push({
            user_id: x.user_id,
            comment_id: x.comment_id,
            created_at: x.created_at,
            comment: x.comment,
            mentioned_users:
              mentionedFriends && mentionedFriends.length
                ? mentionedFriends
                : [],
            user_name: x.user_name,
            profile_picture: x.profile_picture,
            next_count: x.next_count || 0,
            previous_count: x.previous_count || 0,
          });
        }
        return {
          total_count: commentListData[0].total_count,
          list_data: resultArray,
        };
      } else return { total_count: 0, list_data: [] };
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async scriptToSendEmailToAdminOnPostReportsService() {
    try {
      const [adminMetaData, reportQuestonData] = await Promise.all([
        this.QuestionRepositoryObj.getAllAdmin(),
        this.QuestionRepositoryObj.getAllReportedQuestionsMetaData(),
      ]);
      if (
        adminMetaData &&
        adminMetaData.length &&
        reportQuestonData &&
        reportQuestonData.length
      ) {
        for (const x of reportQuestonData) {
          const reportMetaDataObj = {
            userName: x.reported_user_name,
            questionTitle: x.question_title,
            createdBy: x.creator_user_name,
            reportReason: x.report_reason,
            link: `${process.env.REPORT_QUESTION_URL}${x.question_id}`,
          };
          for (const y of adminMetaData) {
            const sendGridMailData = {
              templateId: process.env.REPORT_QUESTION_TEMPLATE_ID,
              templateData: reportMetaDataObj,
              toEmail: y.email,
            };
            new SendGrid().sendMail(sendGridMailData);
          }
        }
      }
      return;
    } catch (err) {
      Logger.error(new Error(err));
    }
  }

  async getQuestionTypesService() {
    try {
      return await new QuestionRepository().getQuestionTypes();
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async searchQuestionsService(requestData, userId) {
    try {
      return await new QuestionRepository().searchQuestion(requestData, userId);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getSearchSuggestionsService(requestData, userId) {
    try {
      return await new QuestionRepository().getSearchSuggestions(
        requestData,
        userId
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  //getGloablSearchService
  async getGloablSearchService(requestData, userId) {
    try {
      let elasticIds = [];
      let elasticDataFound = true;
      const data = await new QuestionRepository().searchQuestionGlobal(
        requestData,
        userId
      );
      if (data && data.length) {
        for (let x of data) {
          elasticIds.push(`'${x._id}'`);
        }
      } else {
        elasticDataFound = false;
      }
      if (elasticDataFound) {
        return await new QuestionRepository().viewUsersActivityData(
          requestData,
          userId,
          elasticIds
        );
      } else {
        return { profile_data: {}, activity_data: [] };
      }
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteQuestionAndRelatedPostService(question_id) {
    try {
      return await new QuestionRepository().deleteQuestionAndRelatedPost(question_id);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async deleteSharedPostsService(question_shared_id) {
    try {
      return await new QuestionRepository().deleteSharedPosts(question_shared_id);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }
}

module.exports = QuestionServices;
