const { NOTIFICATION_MESSAGE, NOTIFICATION_TYPE, NOTIFICATION_TITLE } = require('../../utils/NotificationConstants')
const Sequelize = require('../../config/connection');
const { QueryTypes } = require('../../config/connection')
const Logger = require('../../helpers/Logger');
const ErrorHandler = require('../../helpers/ErrorHandler');
const { ERROR_MESSSAGES, HTTP_CODES } = require('../../utils/Constants');
const sendPushNotifications = require('../../helpers/FireBasePush');
const { NotificationModel } = require('../../models')
const { v4: uuidv4 } = require("uuid");
const SendGrid = require('../../helpers/SendGrid')
const ReportRepository = require('../Report/ReportRepository');

const getDeviceTokens = async (userId) => {
    try {
        const query = `SELECT device_token,device_type FROM "user_devices" WHERE "user_id"=:userId AND notification_enabled=true`;
        return await executeSelectRawQuery(query, { userId: userId });
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const executeSelectRawQuery = async (query, replacements) => {
    try {
        return await Sequelize.query(query, { replacements: replacements, type: QueryTypes.SELECT })
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const getReportDetails = async (reportId) => {
    try {
        const query = `SELECT CONCAT("users"."first_name",' ',"users"."last_name") AS "full_name","users"."user_name","reported_comments"."comment_id","reported_comments"."question_shared_id",(CASE WHEN ("report_master"."id" IS NOT NULL) THEN "report_master"."name" ELSE "reported_comments"."other_reason" END) AS "report_reason","user_comments"."comment","reported_comments"."reported_by","reported_comments"."question_id"  FROM reported_comments INNER JOIN "users" ON "users"."user_id"="reported_comments"."reported_by" LEFT JOIN "report_master" ON "report_master"."id"="reported_comments"."report_reason_id" INNER JOIN "user_comments" ON "user_comments"."comment_id"="reported_comments"."comment_id" WHERE "reported_comments"."id"=:reportId`
        const data = await executeSelectRawQuery(query, { reportId: reportId })
        if (data.length) {
            return data;
        }
        else
            throw new ErrorHandler().customError(ERROR_MESSSAGES.UNABLE_TO_UPDATE_STATUS, HTTP_CODES.BAD_REQUEST);
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const sendNotiticationOnAcceptReportedComments = async (reportId) => {
    try {
        const data = await getReportDetails(reportId);
        if (data.length) {
            const payLoadData = {
                type: NOTIFICATION_TYPE.REPORT_COMMENT_ACCEPT,
                message: NOTIFICATION_MESSAGE.REPORT_COMMENT_ACCEPT.replace('"{comment}"', data[0].comment).replace('{user_name}', data[0].full_name),
                comment_id: data[0].comment_id,
                question_shared_id: data[0].question_shared_id,
                question_id: data[0].question_id
            }
            payLoadData.notification_id = uuidv4();
            payLoadData.message = await getNotificationMessage(payLoadData, data);
            payLoadData.notification_id = uuidv4();
            payLoadData.reportId = reportId
            payLoadData.sender_id = data[0].reported_by
            payLoadData.receiver_id = data[0].reported_by
            await saveNotifications(payLoadData);
            const deviceTokens = await getDeviceTokens(data[0].reported_by);
            sendNotifications(deviceTokens, payLoadData);
            return;
        }
        else
            return;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const sendNotiticationOnRejectReportedComments = async (reportId) => {
    try {
        const data = await getReportDetails(reportId);
        if (data.length) {
            const payLoadData = {
                type: NOTIFICATION_TYPE.REPORT_COMMENT_REJECT,
                message: NOTIFICATION_MESSAGE.REPORT_COMMENT_REJECT.replace('"{comment}"', data[0].comment).replace('{user_name}', data[0].full_name).replace('"{commentReason}"', data[0].report_reason).replace('"{comment}"', data[0].comment),
                comment_id: data[0].comment_id,
                question_shared_id: data[0].question_shared_id,
                question_id: data[0].question_id
            }
            payLoadData.notification_id = uuidv4();
            payLoadData.reportId = reportId
            payLoadData.sender_id = data[0].reported_by
            payLoadData.receiver_id = data[0].reported_by
            payLoadData.message = await getNotificationMessage(payLoadData, data);
            await saveNotifications(payLoadData);
            const deviceTokens = await getDeviceTokens(data[0].reported_by);
            sendNotifications(deviceTokens, payLoadData);
            return;
        }
        else
            return;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const saveNotifications = async (notification_content) => {
    try {
        return await NotificationModel.create({
            created_at: Date.now(),
            type: notification_content.type,
            message: notification_content.message,
            event_id: notification_content.reportId,
            sender_id: notification_content.sender_id,
            receiver_id: notification_content.receiver_id,
            notification_id: notification_content.notification_id || uuidv4(),
            reject_reason: notification_content.reject_reason || null,
            request_form_id: notification_content.request_form_id || null,
            question_id: notification_content.question_id || null
        })
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const sendNotifications = async (deviceTokens, payLoadData) => {
    try {
        if (deviceTokens && deviceTokens.length) {
            for (const x of deviceTokens)
                sendPushNotifications(payLoadData, x.device_token, x.device_type)
            return;
        }
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const verificationRequestStatusNotifications = async (requestData, userId, result) => {
    try {
        let notification_content = {}
        if (requestData.account_status) {
            notification_content.type = NOTIFICATION_TYPE.VERIFICATION_REQUEST_ACCEPTED
            notification_content.message = NOTIFICATION_MESSAGE.VERIFICATION_REQUEST_ACCEPTED.replace('{username}', result[1].user_name)
        } else {
            notification_content.type = NOTIFICATION_TYPE.VERIFICATION_REQUEST_REJECTED
            notification_content.message = NOTIFICATION_MESSAGE.VERIFICATION_REQUEST_REJECTED.replace('{username}', result[1].user_name)
            notification_content.reject_reason = requestData.reject_reason
        }
        notification_content.receiver_id = requestData.user_id
        notification_content.sender_id = userId
        notification_content.request_form_id = result[1].dataValues.id
        const multiAccountUserData = await checkForMultipleAccounts(userId);
        const payLoadData = await saveNotifications(notification_content)
        if (multiAccountUserData.multiple_accounts) {
            notification_content.message = `(${multiAccountUserData.user_name}):${notification_content.message}`
        } else {
            notification_content.message = `${notification_content.message}`
        }
        const usersTokens = await getDeviceTokens(requestData.user_id)
        sendNotifications(usersTokens, payLoadData)
        verificationRequestStatusEmailNotification(notification_content, result)
        return;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const verificationRequestStatusEmailNotification = async (notification_content, result) => {
    try {
        const emailData = {
            templateData: {
                emailTitle: NOTIFICATION_TITLE.ACCOUNT_VERIFICATION_REQUEST,
                username: result[1].user_name,
                bodymessage: notification_content.message,
                rejectReason: notification_content.reject_reason
            },
            templateId: process.env.ACCOUNT_VERIFICATION_REQUEST_TEMPLATE_ID,
            toEmail: result[1].email
        }
        new SendGrid().sendMail(emailData)
        return;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

// check if user has added multiple accounts or business accounts..
const checkForMultipleAccounts = async (userId) => {
    try {
        let userData;
        const query = `select parent_id, user_name, (select count(user_id) from users where parent_id =:userId) as counter from users where user_id =:userId;`
        const data = await executeSelectRawQuery(query, { userId: userId });
        if (data && data.length) {
            if (data[0].counter > 0 || data[0].parent_id) {
                userData = {
                    user_name: data[0].user_name,
                    multiple_accounts: true
                }
            } else {
                userData = {
                    user_name: data[0].user_name,
                    multiple_accounts: false
                }
            }
            return userData;
        }
        else
            return 0;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const getNotificationMessage = async (payLoadData, data) => {
    const multiAccountUserData = await checkForMultipleAccounts(data[0].reported_by);
    if (multiAccountUserData.multiple_accounts) {
        return `(${multiAccountUserData.user_name}):${payLoadData.message}`
    } else {
        return `${payLoadData.message}`
    }
}

const getReportedUsersDetails = async (reportId) => {
    try {
        const query = `SELECT users.user_name,reported_users.reported_by,reported_users.reported_to FROM reported_users INNER JOIN users ON reported_users.reported_to=users.user_id WHERE reported_users.id=:reportId`;
        return await executeSelectRawQuery(query, { reportId: reportId });
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const sendNotiticationOnAcceptReportedUsers = async (reportId) => {
    try {
        const data = await getReportedUsersDetails(reportId);
        if (data.length) {
            const payLoadData = {
                type: NOTIFICATION_TYPE.REPORTED_USER_ACCEPTED,
                message: NOTIFICATION_MESSAGE.REPORTED_USER_ACCEPTED.replace('{user_name}', data[0].user_name)
            }
            payLoadData.notification_id = uuidv4();
            payLoadData.message = await getNotificationMessage(payLoadData, data);
            payLoadData.reportId = reportId
            payLoadData.sender_id = data[0].reported_by
            payLoadData.receiver_id = data[0].reported_by
            await saveNotifications(payLoadData);
            const deviceTokens = await getDeviceTokens(data[0].reported_by);
            sendNotifications(deviceTokens, payLoadData);
            return;
        }
        else
            return;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const sendNotiticationOnRejectionReportedUsers = async (reportId) => {
    try {
        const data = await getReportedUsersDetails(reportId);
        if (data.length) {
            const payLoadData = {
                type: NOTIFICATION_TYPE.REPORTED_USER_REJECTED,
                message: NOTIFICATION_MESSAGE.REPORTED_USER_REJECTED.replace('"{user_name}"', data[0].user_name)
            }
            payLoadData.notification_id = uuidv4();
            payLoadData.message = await getNotificationMessage(payLoadData, data);
            payLoadData.reportId = reportId
            payLoadData.sender_id = data[0].reported_by
            payLoadData.receiver_id = data[0].reported_by
            await saveNotifications(payLoadData);
            const deviceTokens = await getDeviceTokens(data[0].reported_by);
            sendNotifications(deviceTokens, payLoadData);
            return;
        }
        else
            return;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const getUseIdsForSendingReplyAndReplyAllNotification = async (reportedUserId, reportedQuestionId) => {
    try {
        let userIds = [];
        if (reportedUserId) {
            userIds = await executeSelectRawQuery(`SELECT  DISTINCT array_agg(reported_by) AS "userId" FROM reported_users WHERE reported_to=:reportedUserId`, { reportedUserId: reportedUserId });
        }
        else if (reportedQuestionId) {
            userIds = await executeSelectRawQuery(`SELECT DISTINCT array_agg(reported_by) AS "userId" FROM reported_questions WHERE question_id=:reportedQuestionId `, { reportedQuestionId: reportedQuestionId });
        }
        if (userIds && userIds.length && userIds[0].userId && userIds[0].userId.length)
            userIds = userIds[0].userId;
        return userIds;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const sendNotificationOnReplyAllForReportedUsersAndPosts = async (reportedQuestionId, reportedUserId, notificationType, notificationMessage, adminId, replyMessage) => {
    try {
        const recieverUserIds = await getUseIdsForSendingReplyAndReplyAllNotification(reportedUserId, reportedQuestionId);
        if (recieverUserIds && recieverUserIds.length) {
            recieverUserIds.forEach(async x => {
                const payLoadData = {
                    type: notificationType,
                    message: notificationMessage.replace("{reply_message}", replyMessage)
                }
                payLoadData.message = await getNotificationMessage(payLoadData, [{ reported_by: x }]);
                payLoadData.notification_id = uuidv4();
                payLoadData.question_id = reportedQuestionId || null;
                payLoadData.reported_user_id = reportedUserId || null;
                payLoadData.sender_id = adminId;
                payLoadData.receiver_id = x;
                await saveNotifications(payLoadData);
                const deviceTokens = await getDeviceTokens(x);
                sendNotifications(deviceTokens, payLoadData);
            })
        }
        else
            return;
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

const sendNotificationOnSingleReplyForReportedUsersAndPosts = async (reportedQuestionId, reportedUserId, notificationType, notificationMessage, adminId, receiverUserId, replyMessage) => {
    try {
        const payLoadData = {
            type: notificationType,
            message: notificationMessage.replace("{reply_message}", replyMessage)
        }
        payLoadData.message = await getNotificationMessage(payLoadData, [{ reported_by: receiverUserId }]);
        payLoadData.notification_id = uuidv4();
        payLoadData.question_id = reportedQuestionId || null;
        payLoadData.reported_user_id = reportedUserId || null;
        payLoadData.sender_id = adminId;
        payLoadData.receiver_id = receiverUserId;
        await saveNotifications(payLoadData);
        const deviceTokens = await getDeviceTokens(receiverUserId);
        sendNotifications(deviceTokens, payLoadData);
    }
    catch (err) {
        Logger.error(new Error(err))
        throw err;
    }
}

module.exports = {
    sendNotiticationOnAcceptReportedComments,
    sendNotiticationOnRejectReportedComments,
    getDeviceTokens,
    sendNotifications,
    saveNotifications,
    verificationRequestStatusNotifications,
    sendNotiticationOnAcceptReportedUsers,
    sendNotiticationOnRejectionReportedUsers,
    sendNotificationOnReplyAllForReportedUsersAndPosts,
    sendNotificationOnSingleReplyForReportedUsersAndPosts
}