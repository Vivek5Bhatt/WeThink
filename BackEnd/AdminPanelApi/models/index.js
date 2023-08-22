const UserModel = require('./Users')
const UserDevicesModel = require('./UserDevices')
const UserContactsModel = require('./UserContacts')
const QuestionModel = require('./Questions')
const QuestionCategoryModel = require('./QuestionCategory')
const QuestionImagesModel = require('./QuestionsImages')
const QuestionOptionsModels = require('./QuestionsOptions')
const CategoryMasterModel = require('./CategoryMaster')
const ExpiredJwtModel = require('./ExpiredJwt')
const ReportMasterModel = require('./ReportMaster')
const ReportCommentModel = require('./ReportedComments')
const UserCommentModel = require('./UserComments')
const NotificationModel = require('./Notifications')
const UserSharedQuestionModel = require('./UserSharedQuestions')
const ReportedQuestionsAdminStatusModel = require('./ReportedQuestionsAdminStatus')
const ReportedQuestionsModel = require('./ReportedQuestions');
const VerificationRequestModel = require('./RequestVerificationForm');
const VerificationCategoriesModel = require('./VerificationCategoryMaster');
const IdentityTypesModel = require('./IdentityTypeMaster');
const ReportedUsersAdminStatusModel = require('./ReportedUsersAdminStatus');
const ReportedUsersModel = require('./ReportedUsersModel');
const ReportReplyModel = require('./ReportReply');
const RemovedSuggestedFriendsModel = require('./RemovedSuggestedFriends');

module.exports = {
    UserModel,
    UserDevicesModel,
    UserContactsModel,
    QuestionModel,
    QuestionCategoryModel,
    QuestionImagesModel,
    QuestionOptionsModels,
    CategoryMasterModel,
    ExpiredJwtModel,
    ReportMasterModel,
    ReportCommentModel,
    UserCommentModel,
    NotificationModel,
    UserSharedQuestionModel,
    ReportedQuestionsAdminStatusModel,
    ReportedQuestionsModel,
    VerificationRequestModel,
    VerificationCategoriesModel,
    IdentityTypesModel,
    ReportedUsersAdminStatusModel,
    ReportedUsersModel,
    ReportReplyModel,
    RemovedSuggestedFriendsModel
}