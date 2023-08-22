import { environment } from "../environments/environment";

export const urls: any = {
  login: environment.baseUrl + "login",
  forgotPassword: environment.baseUrl + "forgot-password",
  changePassword: environment.baseUrl + "reset-password",
  questionsList: environment.baseUrl + "questions",
  categoryList: environment.baseUrl + "master/category",
  deleteQuestion: environment.baseUrl + "questions",
  uploadPhoto: environment.baseUrl + "upload-photo",
  addQuestion: environment.baseUrl + "questions",
  updateQuestion: environment.baseUrl + "questions",
  questionDetail: environment.baseUrl + "questions/detail",
  verifyEmail: environment.baseUrl + "verify-email",
  userProfile: environment.baseUrl + "user/profile",
  userList: environment.baseUrl + "user",
  reportList: environment.baseUrl + "report/master",
  updateReport: environment.baseUrl + "report/master",
  addReport: environment.baseUrl + "report/master",
  reportDelete: environment.baseUrl + "report/master",
  reportedCommentList: environment.baseUrl + "report/reported-comment",
  reportedCommentDetail: environment.baseUrl + "report/reported-comment/detail",
  updateReportedComment: environment.baseUrl + "report/reported-comment",
  getQuestionDetail: environment.baseUrl + "questions/detail",
  reportedPostList: environment.baseUrl + "report/reported-question",
  reportedPostDetail: environment.baseUrl + "report/reported-question/detail",
  reportedUserList: environment.baseUrl + "report/reported-user",
  reportedUserDetail: environment.baseUrl + "report/reported-user/detail",
  changeReportedPostStatus: environment.baseUrl + "report/reported-question",
  requestManagementList: environment.baseUrl + "user/verification-form-list",
  requestManagementDetails: environment.baseUrl + "user/verification-form",
  requestProfileAction: environment.baseUrl + "user/profile-action",
  deleteSuspendUser: environment.baseUrl + "user/delete-suspend",
  healthCheck: environment.baseUrl + "healthcheck",
};

export const data: any = {
  wtCategoryName: "WT",
};
