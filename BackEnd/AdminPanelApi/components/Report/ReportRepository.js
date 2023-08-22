const { ReportMasterModel, ReportCommentModel, ReportedQuestionsAdminStatusModel, QuestionModel, UserModel, ReportedUsersAdminStatusModel, ReportedUsersModel, ReportReplyModel } = require('../../models')
const Logger = require('../../helpers/Logger')
const Sequelize = require('../../config/connection')
const { QueryTypes } = require('../../config/connection')
const { REPORT_STATUS, SORT_TYPE, ERROR_MESSSAGES, HTTP_CODES, REPLY_TYPE, REPORT_MASTER_TYPE } = require('../../utils/Constants')
const { v4: uuidv4 } = require("uuid");
const ErrorHandler = require('../../helpers/ErrorHandler')
const { sendNotiticationOnAcceptReportedUsers, sendNotiticationOnRejectionReportedUsers, sendNotificationOnReplyAllForReportedUsersAndPosts, sendNotificationOnSingleReplyForReportedUsersAndPosts } = require('../Report/NotificationServices');
const { NOTIFICATION_TYPE, NOTIFICATION_MESSAGE } = require('../../utils/NotificationConstants')
const {question: questionES} = require("../../elasticsearch");

class ReportRepository {
    async addReportMaster(params) {
        try {
            return await ReportMasterModel.create(params);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async checkIFNameExists(requestData) {
        try {
            const query = `SELECT "name" FROM "report_master" WHERE lower("name")=:requestName and is_deleted = false and type = ${requestData.type}`;
            return await this.executeSelectRawQuery(query, { requestName: requestData.name.toLowerCase() })
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    //API to fetch reports master lists and search via type of reports
    async getReportMasterList(requestData) {
        try {
            let replacements = {}
            let countQuery = `SELECT COUNT(id) FROM report_master where is_deleted = false`
            let query = `SELECT ({countQuery}) as total_count,report_master.* FROM report_master where is_deleted = false`
            if (requestData.search && requestData.search.trim()) {
                replacements.search = `%${requestData.search}%`
                query += ` AND (report_master.name ilike :search)`
                countQuery += ` AND (report_master.name ilike :search)`
            }
            if (+requestData.type === REPORT_MASTER_TYPE.POST_REPORT || +requestData.type === REPORT_MASTER_TYPE.USER_REPORT) {
                query += ` AND (report_master.type=:reportType)`
                countQuery += ` AND (report_master.type=:reportType)`
                replacements.reportType = +requestData.type;
            }
            query += ` ORDER BY report_master.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`
            replacements.page_number = Number(requestData.page_number)
            replacements.limit = Number(requestData.limit)
            query = query.replace('{countQuery}', countQuery)
            return await this.executeSelectRawQuery(query, replacements)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async deleteReportMaster(requestData) {
        try {
            return await ReportMasterModel.update({ is_deleted: true }, { where: { id: requestData.id } });

        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async executeSelectRawQuery(query, replacements, t = null) {
        try {
            if (!t)
                return await Sequelize.query(query, { replacements: replacements, type: QueryTypes.SELECT });
            else
                return await Sequelize.query(query, { replacements: replacements, type: QueryTypes.SELECT, transaction: t });
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedCommentList(requestData, userId) {
        try {
            let replacements = {}
            let countQuery = `SELECT COUNT(*) FROM "reported_comments" INNER JOIN "user_comments" ON "user_comments"."comment_id"="reported_comments"."comment_id" INNER JOIN "users" ON "users"."user_id"="reported_comments"."reported_by" INNER JOIN "questions"  ON "questions"."question_id"="reported_comments"."question_id" LEFT JOIN "report_master" ON "report_master"."id"="reported_comments"."report_reason_id"`
            let query = `SELECT ({countQuery}) as total_count,"reported_comments"."id","user_comments"."comment","questions"."question_title","reported_comments"."report_status",(CASE WHEN ("reported_comments"."report_reason_id" IS NOT NULL) THEN "report_master"."name" ELSE "reported_comments"."other_reason" END) AS "report_reason","reported_comments"."report_reason_id","reported_comments"."question_id","reported_comments"."question_shared_id","reported_comments"."comment_id" FROM "reported_comments" INNER JOIN "user_comments" ON "user_comments"."comment_id"="reported_comments"."comment_id" INNER JOIN "users" ON "users"."user_id"="reported_comments"."reported_by" INNER JOIN "questions"  ON "questions"."question_id"="reported_comments"."question_id" LEFT JOIN "report_master" ON "report_master"."id"="reported_comments"."report_reason_id"`
            if (requestData.report_status) {
                replacements.report_status = requestData.report_status
                query += ` WHERE "report_status"=:report_status `
                countQuery += ` WHERE "report_status"=:report_status `
            }
            if (requestData.search && requestData.search.trim()) {
                replacements.search = `%${requestData.search}%`;
                if (!requestData.report_status) {
                    query += ` WHERE ("report_master"."name" ilike :search OR "other_reason" ilike :search OR "question_title" ilike :search OR "comment" ilike :search)`
                    countQuery += `WHERE ("report_master"."name" ilike :search OR "other_reason" ilike :search OR "question_title" ilike :search OR "comment" ilike :search) `
                }
                else {
                    query += ` AND ("report_master"."name" ilike :search OR "other_reason" ilike :search OR "question_title" ilike :search OR "comment" ilike :search)`
                    countQuery += ` AND ("report_master"."name" ilike :search OR "other_reason" ilike :search OR "question_title" ilike :search OR "comment" ilike :search) `
                }
            }
            query += ` ORDER BY reported_comments.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`
            replacements.page_number = Number(requestData.page_number)
            replacements.limit = Number(requestData.limit)
            query = query.replace('{countQuery}', countQuery)
            return await this.executeSelectRawQuery(query, replacements)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async updateReportStatus(requestData, userId) {
        try {
            const query = `UPDATE "reported_comments" SET "report_status"=:reportStatus where "id"=:id AND "report_status"!=:reportStatus RETURNING *`;
            return await this.executeUpdateRawQuery(query, { id: requestData.id, reportStatus: requestData.report_status })

        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async executeUpdateRawQuery(query, replacements) {
        try {
            return await Sequelize.query(query, { replacements: replacements, type: QueryTypes.UPDATE })
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async updateReportedCommentStatus(requestData) {
        try {
            await ReportCommentModel.update({ is_active: false }, { where: { id: requestData.id } });
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async updateReportMaster(requestData) {
        try {
            return await ReportMasterModel.update({ name: requestData.name }, { where: { id: requestData.id } });

        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }


    async getQuestionDetails(requestData) {
        try {
            const query = `SELECT  user_comments.comment,user_comments.comment_id,questions.question_id,questions.question_date,questions.question_title,question_category_mapping.category_id,questions_images.image_url,questions_categories_master.category_name,users.first_name,users.last_name,CONCAT(users.first_name,'',users.last_name) AS full_name,users.profile_picture,users.user_id,"reporter"."profile_picture" AS "reported_by_picure","reporter"."user_name" AS "reported_by_user_name","reported_comments"."reported_by" AS "reported_by_user_id","reported_comments"."created_at" AS "reported_date","reported_comments"."report_status",(CASE WHEN ("reported_comments"."report_reason_id" IS NOT NULL) THEN "report_master"."name" ELSE "reported_comments"."other_reason" END) AS "report_reason" FROM reported_comments INNER JOIN questions USING(question_id) INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN questions_categories_master USING (category_id) INNER JOIN users ON users.user_id=questions.created_by INNER JOIN user_comments USING(comment_id) INNER JOIN "users" "reporter" ON "reporter"."user_id"="reported_comments"."reported_by"  LEFT JOIN "report_master" ON "report_master"."id"="reported_comments"."report_reason_id" WHERE (questions.is_deleted=false AND questions.is_active=true) AND reported_comments.id=:reportId`
            return await this.executeSelectRawQuery(query, { reportId: requestData.id })
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getQuestionOptionDetails(requestData) {
        try {
            const query = `SELECT question_option_id,options AS name,option_number AS option FROM reported_comments INNER JOIN question_options USING(question_id) WHERE reported_comments.id=:reportId ORDER BY option_number`
            return await this.executeSelectRawQuery(query, { reportId: requestData.id })
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedQuestionList(requestData) {
        try {
            let replacements = {}
            let countQuery = `SELECT COUNT(DISTINCT "reported_questions"."question_id") FROM "reported_questions" LEFT JOIN "questions"  ON "questions"."question_id"="reported_questions"."question_id"`;
            let query = `SELECT * from (
            SELECT DISTINCT ON (1, "reported_questions"."question_id") count(*) OVER (PARTITION BY "reported_questions"."question_id") AS reported_count,"questions_categories_master"."category_name","questions"."question_title","reported_questions"."report_status","reported_questions"."question_id", "reported_questions"."created_at",({countQuery}) as total_count,"reported_questions"."reported_by" FROM "reported_questions" LEFT JOIN "questions"  ON "questions"."question_id"="reported_questions"."question_id" LEFT JOIN "question_category_mapping" ON "question_category_mapping"."question_id"="reported_questions"."question_id"  LEFT JOIN "questions_categories_master" ON "questions_categories_master"."category_id"="question_category_mapping"."category_id"`
            if (requestData.search && requestData.search.trim()) {
                replacements.search = `%${requestData.search}%`;
                query += ` WHERE ("question_title" ilike :search)`
                countQuery += ` WHERE ("question_title" ilike :search) `
            }
            query += ` ) t ORDER BY "t"."created_at"  desc OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
            replacements.page_number = Number(requestData.page_number);
            replacements.limit = Number(requestData.limit);
            query = query.replace('{countQuery}', countQuery);
            return await this.executeSelectRawQuery(query, replacements);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportQuestionDetails(requestData) {
        try {
            const query = `SELECT (SELECT report_status FROM reported_questions WHERE question_id =:questionId ORDER BY created_at DESC LIMIT 1) as report_status, questions.question_id, questions.question_type, questions.question_title, question_category_mapping.category_id, "questions_images"."question_cover_type", "questions_images"."image_url", "questions_images"."video_url", "questions_images"."video_thumbnail",questions_categories_master.category_name, CONCAT(users.first_name, '', users.last_name) AS full_name, users.profile_picture, users.user_id FROM questions INNER JOIN question_category_mapping USING (question_id) INNER JOIN questions_images USING (question_id) INNER JOIN questions_categories_master USING (category_id) INNER JOIN users ON users.user_id = questions.created_by WHERE (questions.is_deleted = false) AND questions.question_id =:questionId`;
            return await this.executeSelectRawQuery(query, { questionId: requestData.id });
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportQuestionOptionDetails(requestData) {
        try {
            const query = `SELECT distinct question_option_id,options AS name,option_number AS option FROM reported_questions INNER JOIN question_options USING(question_id) WHERE question_options.question_id=:questionId ORDER BY option_number`;
            return await this.executeSelectRawQuery(query, { questionId: requestData.id });
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportQuestionUserDetails(requestData) {
        try {
            let replacements = {}
            let query = `SELECT "users"."user_name" AS "reported_user_name", CONCAT(users.first_name,' ',users.last_name) AS reported_full_name,"users"."profile_picture","reported_questions"."reported_by" AS "reported_by_user_id","reported_questions"."created_at" AS "reported_date","reported_questions"."user_channel_id","reported_questions"."group_channel_id","reported_questions"."report_status",(CASE WHEN ("reported_questions"."report_reason_id" IS NOT NULL) THEN "report_master"."name" ELSE "reported_questions"."other_reason" END) AS "report_reason",admin_report_replies.type,admin_report_replies.reply_message FROM reported_questions LEFT JOIN "users" ON "users"."user_id"="reported_questions"."reported_by"  LEFT JOIN "report_master" ON "report_master"."id"="reported_questions"."report_reason_id" LEFT JOIN admin_report_replies ON admin_report_replies.user_id=reported_questions.reported_by AND admin_report_replies.reported_question_id=:questionId  WHERE reported_questions.question_id=:questionId`
            replacements.questionId = requestData.id;
            if (requestData.search && requestData.search.trim()) {
                replacements.search = `%${requestData.search}%`;
                query += ` AND (("users"."user_name" ilike :search) OR (CONCAT(users.first_name,' ',users.last_name) ilike :search))`;
            }
            if (requestData.start_date) {
                query += ` AND reported_questions.created_at > :start_date`;
                replacements.start_date = requestData.start_date;
            }
            if (requestData.end_date) {
                query += ` AND reported_questions.created_at < :end_date`;
                replacements.end_date = requestData.end_date;
            }

            if (requestData.sort_type && +requestData.sort_type === SORT_TYPE.ASC) {
                query += ` ORDER BY reported_questions.created_at ASC`;
            } else if (requestData.sort_type && +requestData.sort_type === SORT_TYPE.DESC) {
                query += ` ORDER BY reported_questions.created_at DESC`;
            }
            return await this.executeSelectRawQuery(query, replacements)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportQuestionAdminStatus(requestData) {
        try {
            return await ReportedQuestionsAdminStatusModel.findAll({
                where: {
                    question_id: requestData.id
                },
                attributes: ['reject_reason', 'created_at', 'is_accepted']
            })
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }

    }

    async updateQuestionReportStatus(requestData) {
        try {
            const query = `UPDATE "reported_questions" SET "report_status"=:reportStatus where "question_id"=:id AND "report_status"!=:reportStatus RETURNING *`;
            return await this.executeUpdateRawQuery(query, { id: requestData.id, reportStatus: requestData.report_status });
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async updateReportedQuestionStatus(requestData) {
        try {
            await QuestionModel.update({ is_active: false }, { where: { question_id: requestData.id } });
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async addReportedQuestionAdminStatus(requestData, userId) {
        try {
            await ReportedQuestionsAdminStatusModel.create(
                {
                    id: uuidv4(),
                    question_id: requestData.id,
                    is_accepted: requestData.is_accepted,
                    reject_reason: requestData.reject_reason || null,
                    created_by: userId
                }
            );
            if(requestData.is_accepted){
                questionES.updateActive(requestData.id, false, {});
                questionES.updateDeletion(requestData.id, true, {});
            }
            return true;
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedusersList(requestData) {
        try {
            let replacements = {}
            let countQuery = `SELECT COUNT(DISTINCT "reported_users"."reported_to") FROM "reported_users" LEFT JOIN "users" as reported_by_user  ON "reported_by_user"."user_id"="reported_users"."reported_by" LEFT JOIN "users" as reported_to_user  ON "reported_to_user"."user_id"="reported_users"."reported_to"`;
            let query = `SELECT * from (
            SELECT DISTINCT ON (1, "reported_users"."reported_to") count(*) OVER (PARTITION BY "reported_users"."reported_to") AS reported_count,CONCAT(reported_by_user.first_name,' ',reported_by_user.last_name) AS reported_by_name ,"reported_by_user"."user_id" as reported_by_id, "reported_users"."report_status",CONCAT(reported_to_user.first_name,' ',reported_to_user.last_name) AS reported_to_name ,"reported_to_user"."user_id" as reported_to_id,({countQuery}) as total_count, "reported_users".created_at,reported_users.id AS report_id FROM "reported_users" LEFT JOIN "users" as reported_by_user ON "reported_by_user"."user_id"="reported_users"."reported_by" LEFT JOIN "users" as reported_to_user  ON "reported_to_user"."user_id"="reported_users"."reported_to"`;

            if (requestData.search && requestData.search.trim()) {
                replacements.search = `%${requestData.search}%`;
                query += ` WHERE ((CONCAT(reported_to_user.first_name,' ',reported_to_user.last_name) ilike :search) OR (CONCAT(reported_by_user.first_name,' ',reported_by_user.last_name) ilike :search))`
                countQuery += ` WHERE ((CONCAT(reported_to_user.first_name,' ',reported_to_user.last_name) ilike :search) OR (CONCAT(reported_by_user.first_name,' ',reported_by_user.last_name) ilike :search))`
            }

            query += ` ) t ORDER BY "t"."created_at"  desc OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;
            replacements.page_number = Number(requestData.page_number);
            replacements.limit = Number(requestData.limit);
            query = query.replace('{countQuery}', countQuery);
            return await this.executeSelectRawQuery(query, replacements);
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportedUserDetails(requestData) {
        try {
            return await UserModel.findOne({
                where: { user_id: requestData.user_id },
                attributes: ['first_name', 'last_name', 'profile_picture', 'user_name', 'gender', 'email', 'state', 'country_code', 'website', 'title', 'bio', 'phone_number', 'country_code', 'county']
            });
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportByUserDetails(requestData) {
        try {
            let replacements = {}
            let query = `SELECT "users"."user_name" AS "user_name", CONCAT(users.first_name,' ',users.last_name) AS full_name,"users"."profile_picture","reported_users"."reported_by" AS "reported_by_user_id","reported_users"."created_at" AS "reported_date","reported_users"."report_status",(CASE WHEN ("reported_users"."report_reason_id" IS NOT NULL) THEN "report_master"."name" ELSE "reported_users"."other_reason" END) AS "report_reason",reported_users.id AS report_id,admin_report_replies.type,admin_report_replies.reply_message FROM reported_users LEFT JOIN "users" ON "users"."user_id"="reported_users"."reported_by"  LEFT JOIN "report_master" ON "report_master"."id"="reported_users"."report_reason_id" LEFT JOIN admin_report_replies ON admin_report_replies.user_id=reported_users.reported_by AND admin_report_replies.reported_user_id=:userId WHERE reported_users.reported_to=:userId ORDER BY reported_users.created_at DESC OFFSET ((:page_number - 1) * :limit) ROWS FETCH NEXT :limit ROWS ONLY`;

            replacements.userId = requestData.user_id;
            replacements.page_number = Number(requestData.page_number);
            replacements.limit = Number(requestData.limit);
            return await this.executeSelectRawQuery(query, replacements)
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async getReportUserAdminStatus(requestData) {
        try {
            return await ReportedUsersAdminStatusModel.findAll({
                where: {
                    user_id: requestData.user_id
                },
                attributes: ['reject_reason', 'created_at', 'status']
            })
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }

    async reportedUserActionRepository(requestData) {
        const t = await Sequelize.transaction();
        try {
            const getReportedUserData = await ReportedUsersModel.findOne({ where: { id: requestData.report_id }, attributes: ['report_status', 'reported_to'], transaction: t });
            if (getReportedUserData && getReportedUserData.dataValues) {
                if (getReportedUserData.dataValues.report_status !== REPORT_STATUS.PENDING)
                    throw new ErrorHandler().customError(ERROR_MESSSAGES.REPORT_ACTION_NOT_ALLOWED, HTTP_CODES.BAD_REQUEST);
                await ReportedUsersModel.update({ report_status: +requestData.report_status }, { where: { id: requestData.report_id }, transaction: t });
                if (+requestData.report_status === REPORT_STATUS.ACCEPTED) {
                    await UserModel.update({ is_active: false }, { where: { user_id: getReportedUserData.dataValues.reported_to }, transaction: t });
                }
                await ReportedUsersAdminStatusModel.update({ status: +requestData.report_status }, { where: { user_id: getReportedUserData.dataValues.reported_to }, transaction: t });
                await t.commit();
                if (+requestData.report_status === REPORT_STATUS.ACCEPTED) {
                    sendNotiticationOnAcceptReportedUsers(requestData.report_id);
                }
                else if (+requestData.report_status == REPORT_STATUS.REJECTED) {
                    sendNotiticationOnRejectionReportedUsers(requestData.report_id);
                }
            }
            else
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_REPORT_ID, HTTP_CODES.BAD_REQUEST);
        }
        catch (err) {
            await t.rollback();
            Logger.error(err);
            throw err;
        }
    }


    async getUserIdsForAdminReply(requestData, t) {
        try {
            let userIds = [];
            if (requestData.replied_to_user_id) {
                userIds = [requestData.replied_to_user_id];
                return userIds;
            }
            else if (requestData.reported_user_id) {
                userIds = await this.executeSelectRawQuery(`SELECT  DISTINCT array_agg(reported_by) AS "userId" FROM reported_users WHERE reported_to=:reportedUserId`, { reportedUserId: requestData.reported_user_id }, t);
            }
            else if (requestData.reported_question_id) {
                userIds = await this.executeSelectRawQuery(`SELECT DISTINCT array_agg(reported_by) AS "userId" FROM reported_questions WHERE question_id=:reportedQuestionId `, { reportedQuestionId: requestData.reported_question_id }, t);

            }
            if (userIds && userIds.length && userIds[0].userId && userIds[0].userId.length)
                userIds = userIds[0].userId;
            return userIds;
        }
        catch (err) {
            Logger.error(new Error(err));
            throw err;
        }
    }

    async saveReportAdminReplyRepository(requestData, adminId) {
        const t = await Sequelize.transaction();
        try {
            const userId = await this.getUserIdsForAdminReply(requestData, t);
            const insertArray = [];
            if (userId && userId.length) {
                userId.forEach(x => {
                    insertArray.push({
                        id: uuidv4(),
                        admin_id: adminId,
                        created_at: Date.now(),
                        reported_user_id: requestData.reported_user_id || null,
                        reported_question_id: requestData.reported_question_id || null,
                        user_id: x,
                        type: requestData.type,
                        reply_message: requestData.reply_message
                    })
                })
                await ReportReplyModel.bulkCreate(insertArray, { transaction: t });
            }
            await t.commit();
            this.sendNotificationOnReply(requestData, adminId);
        }
        catch (err) {
            await t.rollback();
            Logger.error(new Error(err));
            throw err;
        }
    }


    async sendNotificationOnReply(requestData, adminId) {
        try {
            if (+requestData.type === +REPLY_TYPE.SINGLE_REPLY) {
                if (requestData.reported_question_id)
                    sendNotificationOnSingleReplyForReportedUsersAndPosts(requestData.reported_question_id, requestData.reported_user_id, NOTIFICATION_TYPE.REPORTED_POST_SINGLE_REPLY, NOTIFICATION_MESSAGE.REPORTED_POST_SINGLE_REPLY, adminId, requestData.replied_to_user_id, requestData.reply_message);
                else if (requestData.reported_user_id)
                    sendNotificationOnSingleReplyForReportedUsersAndPosts(requestData.reported_question_id, requestData.reported_user_id, NOTIFICATION_TYPE.REPORTED_USER_SINGLE_REPLY, NOTIFICATION_MESSAGE.REPORTED_USER_SINGLE_REPLY, adminId, requestData.replied_to_user_id, requestData.reply_message)
            }
            else if (+requestData.type === +REPLY_TYPE.REPLY_ALL) {
                if (requestData.reported_question_id)
                    sendNotificationOnReplyAllForReportedUsersAndPosts(requestData.reported_question_id, requestData.reported_user_id, NOTIFICATION_TYPE.REPORTED_POST_GROUP_REPLY, NOTIFICATION_MESSAGE.REPORTED_POST_GROUP_REPLY, adminId, requestData.reply_message);
                else if (requestData.reported_user_id)
                    sendNotificationOnReplyAllForReportedUsersAndPosts(requestData.reported_question_id, requestData.reported_user_id, NOTIFICATION_TYPE.REPORTED_USER_GROUP_REPLY, NOTIFICATION_MESSAGE.REPORTED_USER_GROUP_REPLY, adminId, requestData.reply_message)
            }
        }
        catch (err) {
            Logger.error(new Error(err));
        }
    }


}


module.exports = ReportRepository


