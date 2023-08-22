const {
  NOTIFICATION_MESSAGE,
  NOTIFICATION_TYPE,
} = require("../../utils/NoitificationConstants");
const Sequelize = require("../../config/connection");
const { QueryTypes } = require("../../config/connection");
const Notifications = require("../../models/Notifications");
const { v4: uuidv4 } = require("uuid");
const Logger = require("../../helpers/Logger");
const sendPushNotifications = require("../../helpers/FireBasePush");
const { THRESHOLD_TYPE } = require("../../utils/Constants");
const { NotificationsModel, UserDevicesModel } = require("../../models");

const getDeviceTokens = async (params, excludeUserId) => {
  try {
    let replacements = {
      questionId: params.question_id,
      excludeUserId: excludeUserId,
    };
    let sharedQustionQuery = ``;
    if (params.question_shared_id) {
      replacements.questionSharedId = params.question_shared_id;
      sharedQustionQuery = `OR "question_shared_id"=:questionSharedId`;
    }
    const query = `SELECT device_token,device_type FROM user_devices WHERE "user_id" IN (SELECT "user_id" FROM "silent_push_audit" WHERE ("question_id"=:questionId ${sharedQustionQuery}) AND "user_id"!=:excludeUserId) AND notification_enabled=true`;
    const data = await executeSelectRawQuery(query, replacements);
    if (data && data.length) return data;
    else return null;
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const executeSelectRawQuery = async (query, replacements) => {
  try {
    return await Sequelize.query(query, {
      replacements: replacements,
      type: QueryTypes.SELECT,
    });
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const sendSilentPushNotificationOnComment = async (params, pushData) => {
  try {
    pushData.badgeCount = await getBadgeCountOfUsers(pushData.push_user_id); //push_user_id is to exclude the userId while sending silent push
    const deviceTokens = await getDeviceTokens(params, pushData.push_user_id);
    if (deviceTokens && deviceTokens.length) {
      for (const x of deviceTokens) {
        await sendPushNotifications(pushData, x.device_token, x.device_type);
      }
    } else return;
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const saveNotifications = async (payLoadData) => {
  try {
   return await Notifications.create({
      created_at: Date.now(),
      type: payLoadData.type,
      message: payLoadData.message,
      event_id: payLoadData.event_id,
      sender_id: payLoadData.sender_id,
      receiver_id: payLoadData.receiver_id,
      notification_id: payLoadData.notification_id || uuidv4(),
      question_shared_id: payLoadData.question_shared_id || null,
      question_id: payLoadData.question_id || null,
      comment_id: payLoadData.comment_id || null,
      parent_comment_id: payLoadData.parent_comment_id || null,
    });
    // return;
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const likePostNotifications = async (requestData) => {
  try {
    let whereCondition;
    const notificationObj = {};
    let deleteQuery = `DELETE FROM notifications WHERE type=:type AND receiver_id=:receiverId `;
    if (requestData.question_id && !requestData.question_shared_id) {
      whereCondition = ` question_id='${requestData.question_id}'`;
      deleteQuery += ` AND question_id='${requestData.question_id}'`;
    } else if (requestData.question_id && requestData.question_shared_id) {
      whereCondition = ` question_shared_id='${requestData.question_shared_id}'`;
      deleteQuery += ` AND question_shared_id='${requestData.question_shared_id}'`;
    }
    const [data, likesCount] = await Promise.all([
      getDetailsOnQuestionAndSharedQuestion(requestData),
      executeSelectRawQuery(
        `SELECT COALESCE(COUNT(*),0) AS count FROM user_likes WHERE ${whereCondition} UNION ALL SELECT threshold_count AS count FROM threshold_master where type=${THRESHOLD_TYPE.GROUP_LIKES}`,
        {}
      ),
    ]);
    if (data && data.length && likesCount && likesCount.length) {
      if (String(requestData.userId) === String(data[0].receiver_id)) return;
      notificationObj.type = NOTIFICATION_TYPE.LIKE_POST;
      notificationObj.event_id = data[0].event_id;
      notificationObj.sender_id = requestData.userId;
      notificationObj.receiver_id = data[0].receiver_id;
      notificationObj.question_id = requestData.question_id || null;
      notificationObj.question_shared_id =
        requestData.question_shared_id || null;
      if (likesCount.length >= 2) {
        if (+likesCount[0].count >= +likesCount[1].count) {
          //if likes count matches the threshold counts
          notificationObj.message = NOTIFICATION_MESSAGE.GROUP_LIKES.replace(
            "{user_name}",
            data[0].sender_name
          ).replace("{count}", +likesCount[0].count - 1);
          await executeDeleteRawQuery(deleteQuery, {
            type: NOTIFICATION_TYPE.LIKE_POST,
            receiverId: data[0].receiver_id,
          });
        }
      } else {
        notificationObj.message = NOTIFICATION_MESSAGE.LIKE_POST.replace(
          "{user_name}",
          data[0].sender_name
        );
      }
      notificationObj.notification_id = uuidv4();
      // check to add username key..
      notificationObj.message = await getNotificationMessage(
        notificationObj,
        data
      );
      let res = await saveNotifications(notificationObj);

      notificationObj.created_at = res ? res.created_at : '';

      notificationObj.seen = res ? res.seen : false;

      notificationObj.badgeCount = await getBadgeCountOfUsers(data[0].receiver_id);
      if (requestData.question_id || requestData.question_shared_id)
        notificationObj.is_commenting_enabled = true
      else
        notificationObj.is_commenting_enabled = null

      const deviceTokens = await getReceiverDeviceTokens(data[0].receiver_id);
      if (deviceTokens && deviceTokens.length) {
        for (const x of deviceTokens) {
          sendPushNotifications(notificationObj, x.device_token, x.device_type);
        }
      }
    } else return;
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const commentPostNotifications = async (requestData) => {
  try {
    let data, commentCount;
    let whereCondition;
    const notificationObj = {};
    let deleteQuery = `DELETE FROM notifications WHERE type=:type AND receiver_id=:receiverId `;
    if (requestData.question_id && !requestData.question_shared_id) {
      whereCondition = ` question_id='${requestData.question_id}'  and parent_id is null`;
      deleteQuery += ` AND question_id='${requestData.question_id}' and parent_comment_id is null`;
    } else if (requestData.question_id && requestData.question_shared_id) {
      whereCondition = ` question_shared_id='${requestData.question_shared_id}' and parent_id is null`;
      deleteQuery += ` AND question_shared_id='${requestData.question_shared_id}' and parent_comment_id is null`;
    }
    [data, commentCount] = await Promise.all([
      getDetailsOnQuestionAndSharedQuestionOnComments(requestData),
      executeSelectRawQuery(
        `SELECT COALESCE(COUNT(user_comments.comment_id),0) AS count FROM user_comments WHERE ${whereCondition} AND is_active=true AND is_deleted=false GROUP BY user_id UNION ALL SELECT threshold_count AS count FROM threshold_master where type=${THRESHOLD_TYPE.GROUP_COMMENTS}`,
        {}
      ),
    ]);
    if (data && data.length && commentCount && commentCount.length) {
      mentionedUsersNotifications(requestData, data[0]);
      if (String(requestData.push_user_id) === String(data[0].receiver_id))
        return;
      requestData.receiver_id = data[0].receiver_id;
      if (
        await getTheLastestCommentOnPostIsGreaterThanSpecifiedMinutes(
          requestData,
          requestData.push_user_id
        )
      )
        return;
      notificationObj.type = NOTIFICATION_TYPE.COMMENT_POST;
      notificationObj.event_id = requestData.comment_id;
      notificationObj.sender_id = requestData.push_user_id;
      notificationObj.receiver_id = data[0].receiver_id;
      notificationObj.question_id = requestData.question_id || null;
      notificationObj.question_shared_id =
        requestData.question_shared_id || null;
      notificationObj.comment_id = requestData.comment_id;
      if (commentCount.length >= 2) {
        if (+commentCount.length >= +commentCount[1].count) {
          //if likes count matches the threshold counts
          notificationObj.message = NOTIFICATION_MESSAGE.GROUP_COMMENTS.replace(
            "{user_name}",
            data[0].sender_name
          ).replace("{count}", +commentCount.length - 1);
          await executeDeleteRawQuery(deleteQuery, {
            type: NOTIFICATION_TYPE.COMMENT_POST,
            receiverId: data[0].receiver_id,
          });
        }
      } else {
        notificationObj.message = NOTIFICATION_MESSAGE.COMMENT_POST.replace(
          "{user_name}",
          data[0].sender_name
        );
      }
      notificationObj.notification_id = uuidv4();
      // add username to message if required ..
      notificationObj.message = await getNotificationMessage(
        notificationObj,
        data
      );
      let res = await saveNotifications(notificationObj);

      notificationObj.created_at = res ? res.created_at : '';

      notificationObj.seen = res ? res.seen : false;

      notificationObj.badgeCount = await getBadgeCountOfUsers(data[0].receiver_id);
      if (requestData.question_id || requestData.question_shared_id)
        notificationObj.is_commenting_enabled = true
      else
        notificationObj.is_commenting_enabled = null
      const deviceTokens = await getReceiverDeviceTokens(data[0].receiver_id);
      if (deviceTokens && deviceTokens.length) {
        for (const x of deviceTokens) {
          sendPushNotifications(notificationObj, x.device_token, x.device_type);
        }
      } else return;
    }
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const mentionedUsersNotifications = async (requestData, queryData) => {
  try {
    if (requestData.mentioned_users && requestData.mentioned_users.length) {
      for (const x of requestData.mentioned_users) {
        let whereCondition;
        const notificationObj = {};
        notificationObj.type = NOTIFICATION_TYPE.MENTIONED_USERS;
        notificationObj.event_id = requestData.comment_id;
        notificationObj.sender_id = requestData.push_user_id;
        notificationObj.receiver_id = x.user_id;
        notificationObj.question_id = requestData.question_id || null;
        notificationObj.question_shared_id =
          requestData.question_shared_id || null;
        notificationObj.comment_id = requestData.comment_id;
        notificationObj.parent_comment_id = requestData.parent_id || null;
        let deleteQuery = `DELETE FROM notifications WHERE type=:type AND receiver_id=:receiverId `;
        if (requestData.question_id && !requestData.question_shared_id) {
          whereCondition = `AND question_id='${requestData.question_id}'`;
          deleteQuery += ` AND question_id='${requestData.question_id}'`;
        } else if (requestData.question_id && requestData.question_shared_id) {
          whereCondition = `AND question_shared_id='${requestData.question_shared_id}'`;
          deleteQuery += ` AND question_shared_id='${requestData.question_shared_id}'`;
        }
        const thresholdCount = await executeSelectRawQuery(
          `SELECT COALESCE(COUNT(comment_mention_id),0) AS count FROM user_comment_mentions INNER JOIN user_comments ON user_comments.comment_id=user_comment_mentions.comment_id WHERE user_comments.is_active=true AND user_comments.is_deleted=false ${whereCondition} AND user_comment_mentions.user_id='${x.user_id}' UNION ALL SELECT threshold_count AS count FROM threshold_master where type=${THRESHOLD_TYPE.GROUP_MENTIONED_USERS} `,
          {}
        );
        if (thresholdCount && thresholdCount.length) {
          // if (+thresholdCount[0].count >= +thresholdCount[1].count) {
          //   await executeDeleteRawQuery(deleteQuery, {
          //     type: NOTIFICATION_TYPE.MENTIONED_USERS,
          //     receiverId: x.user_id,
          //   });
          //   notificationObj.message =
          //     NOTIFICATION_MESSAGE.MENTIONED_USERS.replace(
          //       "{user_name}",
          //       queryData.sender_name
          //     ).replace("{count}", +thresholdCount[0].count - 1);
          // } else
          notificationObj.message =
            NOTIFICATION_MESSAGE.MENTIONED_USERS.replace(
              "{user_name}",
              queryData.sender_name
            );
          notificationObj.notification_id = uuidv4();
          notificationObj.badgeCount = await getBadgeCountOfUsers(x.user_id);
          const multiAccountUserData = await checkForMultipleAccounts(
            x.user_id
          );
          if (multiAccountUserData.multiple_accounts) {
            notificationObj.message = `${notificationObj.message}`;
          } else {
            notificationObj.message = `${notificationObj.message}`;
          }
         let res = await saveNotifications(notificationObj);

         notificationObj.created_at = res ? res.created_at : '';

         notificationObj.seen = res ? res.seen : false;

          if (requestData.question_id || requestData.question_shared_id)
            notificationObj.is_commenting_enabled = true
          else
            notificationObj.is_commenting_enabled = null
          const deviceTokens = await getReceiverDeviceTokens(x.user_id);
          if (deviceTokens && deviceTokens.length) {
            for (const y of deviceTokens) {
              sendPushNotifications(
                notificationObj,
                y.device_token,
                y.device_type
              );
            }
          }
        }
      }
    }
    return;
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const getDetailsOnQuestionAndSharedQuestion = async (requestData) => {
  try {
    let query;
    if (requestData.question_id && !requestData.question_shared_id) {
      query = ` SELECT questions.created_by AS receiver_id,questions.question_id AS event_id,users.user_name AS sender_name FROM user_likes INNER JOIN questions USING(question_id) INNER JOIN users ON users.user_id=user_likes.user_id WHERE user_likes.question_id=:questionId AND user_likes.user_id=:userId`;
      return await executeSelectRawQuery(query, {
        questionId: requestData.question_id,
        userId: requestData.userId,
      });
    } else if (requestData.question_id && requestData.question_shared_id) {
      query = ` SELECT user_shared_questions.user_id AS receiver_id,user_shared_questions.question_shared_id AS event_id,users.user_name AS sender_name FROM user_likes INNER JOIN user_shared_questions ON user_shared_questions.question_shared_id=user_likes.question_shared_id  INNER JOIN users ON users.user_id=user_likes.user_id WHERE user_likes.question_shared_id=:questionSharedId AND user_likes.user_id=:userId`;
      return await executeSelectRawQuery(query, {
        questionSharedId: requestData.question_shared_id,
        userId: requestData.userId,
      });
    }
  } catch (err) {
    Logger.error(err);
  }
};

const getReceiverDeviceTokens = async (userId) => {
  try {
    const query = `SELECT device_token, device_type FROM user_devices WHERE "user_id" =:userId and notification_enabled = true`;
    const data = await executeSelectRawQuery(query, { userId: userId });
    if (data && data.length) return data;
    else return [];
  } catch (err) {
    Logger.error(err);
  }
};

const getDetailsOnQuestionAndSharedQuestionOnComments = async (requestData) => {
  try {
    let query;
    if (requestData.question_id && !requestData.question_shared_id) {
      query = ` SELECT questions.created_by AS receiver_id, questions.question_id AS event_id, users.user_name AS sender_name FROM user_comments INNER JOIN questions USING(question_id) INNER JOIN users ON users.user_id=user_comments.user_id WHERE user_comments.comment_id=:commentId`;
    } else if (requestData.question_id && requestData.question_shared_id) {
      query = ` SELECT user_shared_questions.user_id AS receiver_id,user_shared_questions.question_shared_id AS event_id,users.user_name AS sender_name FROM user_comments INNER JOIN user_shared_questions ON user_shared_questions.question_shared_id=user_comments.question_shared_id  INNER JOIN users ON users.user_id=user_comments.user_id WHERE  user_comments.comment_id=:commentId`;
    }
    return await executeSelectRawQuery(query, {
      commentId: requestData.comment_id,
    });
  } catch (err) {
    Logger.error(err);
  }
};

const executeDeleteRawQuery = async (query, replacements) => {
  try {
    return await Sequelize.query(query, {
      replacements: replacements,
      type: QueryTypes.DELETE,
    });
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const getBadgeCountOfUsers = async (userId) => {
  try {
    const query = `SELECT COALESCE(COUNT(notification_id), 0) AS count FROM "notifications" WHERE "is_read" = false AND "receiver_id" =:userId`;
    const data = await executeSelectRawQuery(query, { userId: userId });
    if (data && data.length) return data[0].count;
    else return 0;
  } catch (err) {
    Logger.error(new Error(err));
  }
};

const commentReplyPostNotifications = async (requestData, userId) => {
  try {
    let data, commentCount, queryData;
    let whereCondition;
    let deviceTokens;
    const notificationObj = {};
    let deleteQuery = `DELETE FROM notifications WHERE type=:type AND receiver_id=:receiverId `;
    if (requestData.question_id && !requestData.question_shared_id) {
      whereCondition = ` question_id='${requestData.question_id}' and user_comments.parent_id is not null and parent_id='${requestData.parent_id}'`;
      deleteQuery += ` AND question_id='${requestData.question_id}' AND parent_comment_id='${requestData.parent_id}'`;
    } else if (requestData.question_id && requestData.question_shared_id) {
      whereCondition = ` question_shared_id='${requestData.question_shared_id}'  and user_comments.parent_id is not null and parent_id='${requestData.parent_id}'`;
      deleteQuery += ` AND question_shared_id='${requestData.question_shared_id}' and parent_comment_id='${requestData.parent_id}'`;
    }
    [data, commentCount, queryData] = await Promise.all([
      replyThreadReceiversData(requestData, userId),
      executeSelectRawQuery(
        `SELECT COALESCE(COUNT(user_comments.comment_id),0) AS count FROM user_comments WHERE ${whereCondition} AND is_active=true AND is_deleted=false GROUP By user_id  UNION ALL SELECT threshold_count AS count FROM threshold_master where type=${THRESHOLD_TYPE.GROUP_COMMENTS}`,
        {}
      ),
      getDetailsOnQuestionAndSharedQuestionOnComments(requestData),
    ]);
    if (data && data.length && commentCount && commentCount.length) {
      if (!queryData.length) return;
      mentionedUsersNotifications(requestData, queryData[0]);
      for (const x of data) {
        requestData.receiver_id = x.user_id;
        notificationObj.type = NOTIFICATION_TYPE.COMMENT_POST;
        notificationObj.event_id = requestData.comment_id;
        notificationObj.sender_id = requestData.push_user_id;
        notificationObj.receiver_id = x.user_id;
        notificationObj.question_id = requestData.question_id || null;
        notificationObj.question_shared_id =
          requestData.question_shared_id || null;
        notificationObj.comment_id = requestData.comment_id;
        notificationObj.parent_comment_id = requestData.parent_id || null;

        if (commentCount.length >= 2) {
          if (+commentCount.length >= +commentCount[0].count) {
          //if likes count matches the threshold counts
          notificationObj.message = NOTIFICATION_MESSAGE.GROUP_REPLY.replace("{user_name}", queryData[0].sender_name
          ).replace("{count}", +commentCount.length - 1);
          await executeDeleteRawQuery(deleteQuery, {
            type: NOTIFICATION_TYPE.COMMENT_POST,
            receiverId: x.user_id,
          });
        }
      } else {
          notificationObj.message = NOTIFICATION_MESSAGE.COMMENT_REPLY.replace("{user_name}", queryData[0].sender_name
          );
        }
        notificationObj.notification_id = uuidv4();
        const multiAccountUserData = await checkForMultipleAccounts(x.user_id);
        if (multiAccountUserData.multiple_accounts) {
          notificationObj.message = `${notificationObj.message}`;
        } else {
          notificationObj.message = `${notificationObj.message}`;
        }
        let res = await saveNotifications(notificationObj);

        notificationObj.created_at = res ? res.created_at : '';

        notificationObj.seen = res ? res.seen : false;

        notificationObj.user_id = userId;
        notificationObj.badgeCount = await getBadgeCountOfUsers(x.user_id);
        if (requestData.question_id || requestData.question_shared_id)
          notificationObj.is_commenting_enabled = true
        else
          notificationObj.is_commenting_enabled = null
        deviceTokens = await getReceiverDeviceTokens(x.user_id);
        if (deviceTokens && deviceTokens.length) {
          for (const y of deviceTokens) {
            sendPushNotifications(
              notificationObj,
              y.device_token,
              y.device_type
            );
          }
        }
      }
    } else return;
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const getAllTheRecieversOfParentComments = async (params, userId) => {
  try {
    const query = `SELECT distinct device_token,device_type FROM user_devices WHERE "user_id" IN (select  DISTINCT(user_id) from user_comments  where parent_id=:parentId) and user_id!=:userId and notification_enabled=true UNION SELECT distinct device_token,device_type FROM user_devices WHERE "user_id" IN (select  DISTINCT(user_id) from user_comments where comment_id=:parentId) and user_id!=:userId and notification_enabled=true`;
    const data = await executeSelectRawQuery(query, {
      parentId: params.parent_id,
      userId: userId,
    });
    if (data && data.length) return data;
    else return [];
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const replyThreadReceiversData = async (params, userId) => {
  try {
    const query = `SELECT DISTINCT users.user_id,users.user_name from user_comments INNER JOIN users ON users.user_id=user_comments.user_id  WHERE "user_comments"."user_id" IN (select DISTINCT user_id from user_comments where parent_id=:parentId) AND user_comments.user_id!=:excludeUserId UNION select DISTINCT users.user_id,users.user_name from user_comments INNER JOIN users ON users.user_id=user_comments.user_id where user_comments.comment_id=:parentId AND user_comments.user_id!=:excludeUserId`;
    const data = await executeSelectRawQuery(query, {
      parentId: params.parent_id,
      excludeUserId: userId,
    });
    if (data && data.length) return data;
    else return [];
  } catch (err) {
    Logger.error(err);
    throw err;
  }
};

const getTheLastestCommentOnPostIsGreaterThanSpecifiedMinutes = async (
  requestData,
  senderId,
  minutes = 1
) => {
  try {
    let whereQuery = ``;
    if (requestData.question_id)
      whereQuery += ` notifications.question_id='${requestData.question_id}'`;
    if (requestData.question_shared_id)
      whereQuery += ` AND notifications.question_shared_id='${requestData.question_shared_id}'`;
    if (requestData.parent_id)
      whereQuery += ` AND notifications.parent_comment_id='${requestData.parent_id}'`;
    const query = `SELECT user_comments.created_at,notification_id from user_comments INNER JOIN notifications ON notifications.event_id=user_comments.comment_id where ${whereQuery} AND receiver_id='${requestData.receiver_id}' AND notifications.type=${NOTIFICATION_TYPE.COMMENT_POST} AND sender_id='${senderId}' ORDER BY user_comments.created_at DESC LIMIT 1`;
    const data = await executeSelectRawQuery(query, {});
    if (data && data.length) {
      if ((Date.now() - Number(data[0].created_at)) / (60 * 1000) <= minutes) {
        const updateQuery = `UPDATE notifications SET created_at=${Date.now()} WHERE notification_id='${data[0].notification_id
          }'`;
        await executeUpdateRawQuery(updateQuery, {});
        return true;
      }
      return false;
    } else return false;
  } catch (err) {
    Logger.error(err);
    throw err;
  }
};

const executeUpdateRawQuery = async (query, replacements) => {
  try {
    return await Sequelize.query(query, {
      replacements: replacements,
      type: QueryTypes.UPDATE,
    });
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

// check if user has added multiple accounts or business accounts..
const checkForMultipleAccounts = async (userId) => {
  try {
    let userData;
    const query = `select parent_id, user_name , (select count(user_id) from users where parent_id =:userId) as counter from users where user_id =:userId;`;
    const data = await executeSelectRawQuery(query, { userId: userId });
    if (data && data.length) {
      if (data[0].counter > 0 || data[0].parent_id) {
        userData = {
          user_name: data[0].user_name,
          multiple_accounts: true,
        };
      } else {
        userData = {
          user_name: data[0].user_name,
          multiple_accounts: false,
        };
      }
      return userData;
    } else return 0;
  } catch (err) {
    Logger.error(new Error(err));
  }
};

const getNotificationMessage = async (notificationObj, data) => {
  const multiAccountUserData = await checkForMultipleAccounts(
    data[0].receiver_id
  );
  if (multiAccountUserData.multiple_accounts) {
    return `${notificationObj.message}`;
  } else {
    return `${notificationObj.message}`;
  }
};

const sendNotificationToSubscribers = async (questionId, userId) => {
  try {
    const query = `select "users"."user_name","user_subscribers"."subscribed_by" from user_subscribers inner join users on "users"."user_id" = "user_subscribers"."subscribed_to" where subscribed_to =:userId;`;
    const subscriberData = await executeSelectRawQuery(query, {
      userId: userId,
    });
    if (subscriberData && subscriberData.length) {
      sendPostNotificationToSubscribers(subscriberData, questionId, userId);
    }
  } catch (err) {
    Logger.error(new Error(err));
  }
};

const sendPostNotificationToSubscribers = async (
  subscriberData,
  questionId,
  userId
) => {
  try {
    const notificationArr = [];
    if (subscriberData && subscriberData.length) {
      for (let x of subscriberData) {
        let notificationObj = {};
        notificationObj.type = NOTIFICATION_TYPE.POST_CREATED;
        notificationObj.event_id = questionId;
        notificationObj.sender_id = userId;
        notificationObj.receiver_id = x.subscribed_by;
        notificationObj.question_id = questionId || null;
        notificationObj.question_shared_id = null;
        notificationObj.message = NOTIFICATION_MESSAGE.POST_CREATED.replace(
          "{user_name}",
          x.user_name
        )
        notificationObj.notification_id = uuidv4()
        notificationObj.created_at = Date.now()
        notificationArr.push(notificationObj)
        if (questionId)
          notificationObj.is_commenting_enabled = true
        else
          notificationObj.is_commenting_enabled = null
        const deviceTokens = await getSubscriberDeviceTokens(
          x.subscribed_by,
          userId
        )
        if (deviceTokens && deviceTokens.length) {
          for (const y of deviceTokens) {
            notificationObj.badgeCount = await getBadgeCountOfUsers(y.user_id)
            sendPushNotifications(
              notificationObj,
              y.device_token,
              y.device_type
            )
          }
        }
      }
      // save Bulk notifications..
      saveBulkNotifications(notificationArr);
    } else return;
  } catch (err) {
    Logger.error(new Error(err));
  }
};

const getSubscriberDeviceTokens = async (subscribed_by, subscribed_to) => {
  try {
    const query = `SELECT device_token, device_type, user_id FROM user_devices WHERE "user_id" IN (select subscribed_by from user_subscribers where subscribed_by =:subscribed_by and subscribed_to =:subscribed_to and notification_enabled = true)`;
    const data = await executeSelectRawQuery(query, {
      subscribed_by: subscribed_by,
      subscribed_to: subscribed_to,
    });
    if (data && data.length) return data;
    else return [];
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const saveBulkNotifications = async (payLoadData) => {
  try {
    await Notifications.bulkCreate(payLoadData);
    return;
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const sendSilentPushNotificationForCountUpdate = async (params, pushData) => {
  try {
    const query = `select (select count(user_answer_id) from user_answers where question_id =:question_id)as votes_count, (select count(id) from user_likes where question_id =:question_id) as likes_count, (select count(comment_id) from user_comments where question_id =:question_id) as comment_count, count(question_shared_id) as shares_count from user_shared_questions where question_id =:question_id`;
    const data = await executeSelectRawQuery(query, {
      question_id: params.question_id,
    });
    if (data && data.length) {
      data[0].badgeCount = await getBadgeCountOfUsers(pushData.push_user_id);
      data[0].type = NOTIFICATION_TYPE.COMMENT_SILENT_PUSH;
      const deviceTokens = await getDeviceTokens(params, pushData.push_user_id);
      if (deviceTokens) {
        for (const x of deviceTokens) {
          sendPushNotifications(data[0], x.device_token, x.device_type);
        }
      } else return;
    }
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const sendPushNotificationForFollowUpdate = async (friendData) => {
  try {
    const notificationData = await NotificationsModel.findOne({
      where: { event_id: friendData[0].follows_id ? friendData[0].follows_id : friendData[0].follow_request_id }
    });
    const data = notificationData.dataValues
    if (notificationData && notificationData.dataValues) {
      const getDeviceTokens = await UserDevicesModel.findAll({
        where: { user_id: friendData[0].followed_to },
        attributes: [
          "device_token",
          "device_type",
          "notification_enabled"
        ],
      });
      if (getDeviceTokens) {
        for (let x of getDeviceTokens) {
          if (x.notification_enabled) {
            data.badgeCount = await getBadgeCountOfUsers(x.user_id);
            sendPushNotifications(data, x.device_token, x.device_type);
          }
        }
      }
    }
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const sendAnswerNotification = async (answerData) => {
  try {
    const notificationData = await NotificationsModel.findOne({
      where: { sender_id: answerData.sender_id, receiver_id: answerData.receiver_id, type: answerData.type }
    })
    if (notificationData && notificationData.dataValues) {
      const data = notificationData.dataValues
      data.badgeCount = await getBadgeCountOfUsers(answerData.receiver_id);
      const deviceTokens = await UserDevicesModel.findAll({
        where: { user_id: answerData.receiver_id },
        attributes: [
          "device_token",
          "device_type",
          "notification_enabled"
        ],
      })
      if (deviceTokens) {
        for (const x of deviceTokens) {
          if (x.notification_enabled) {
            sendPushNotifications(data, x.device_token, x.device_type);
          }
        }
      } else return
    }
  } catch (err) {
    Logger.error(new Error(err))
    throw err
  }
}

const sendPushNotificationForPollExpired = async (friendData) => {
  try {
    const notificationData = await NotificationsModel.findOne({
      where: { sender_id: friendData.sender_id, receiver_id: friendData.receiver_id, type: friendData.type },
    });
    const data = notificationData.dataValues
    if (notificationData && notificationData.dataValues) {
      const getDeviceTokens = await UserDevicesModel.findAll({
        where: { user_id: friendData.receiver_id },
        attributes: [
          "device_token",
          "device_type",
          "notification_enabled"
        ],
      });
      if (getDeviceTokens) {
        for (let x of getDeviceTokens) {
          if (x.notification_enabled) {
            data.badgeCount = await getBadgeCountOfUsers(x.user_id);
            sendPushNotifications(data, x.device_token, x.device_type);
          }
        }
      }
    }
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

module.exports = {
  sendSilentPushNotificationOnComment,
  likePostNotifications,
  mentionedUsersNotifications,
  commentPostNotifications,
  commentReplyPostNotifications,
  sendNotificationToSubscribers,
  sendSilentPushNotificationForCountUpdate,
  sendPushNotificationForFollowUpdate,
  sendAnswerNotification,
  sendPushNotificationForPollExpired
};
