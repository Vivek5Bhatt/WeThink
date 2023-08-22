const ACCOUNT_TYPE = {
  PUBLIC: 1,
  PRIVATE: 2,
};

const SALT_ROUNDS = 10;

const HTTP_CODES = {
  // Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,

  // Success
  OK: 200,
  CREATED: 201,

  // Redirection
  MOVED_PERMANENTLY: 301,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

const ROLE_IDS = {
  ADMIN: 1,
  USER: 2,
};

const ORM_ERRORS = {
  ALREADY_EXISTS: "23505",
};

const ERROR_MESSSAGES = {
  PASSWORD_MISMATCH: `Password and Confirm Password doesn't match`,
  PHONE_NUMBER_LENGTH: `Please enter valid phone number between 10-15 digits`,
  PASSWORD_LENGTH: `Please enter valid password must be at least 8 characters`,
  PHONE_ALREADY_EXISTS: `Please enter a new phone number.As this phone number is already exists.`,
  EMAIL_ALREADY_EXISTS: `Please enter a new email.As this email is already exists.`,
  UNABLE_TO_SIGNUP: `Unable To Signup!!Please try again`,
  INVALID_PHONE_NUMBER: `Please provide valid phone number`,
  PHONE_NUMBER_NOT_EXISTS: `No account exists with this number`,
  INVALID_COUNTRY_CODE_PHONE_NUMBER: `No account exists with this country code and phone number`,
  OTP_MUST_UNIQUE: `OTP must be unique`,
  OTP_MUST_BE_LENGTH: `OTP must be of 6 digits`,
  INVALID_OTP: `Please Enter a Valid OTP number`,
  OTP_MUST_BE_INTEGER: `OTP must be in number`,
  UNAUTHORIZED: `You are unauthourized to access`,
  INVALID_USER_ID: `Invalid User Id`,
  INVALID_BUSINESS_CATEGORY_ID: `Invalid business category Id`,
  INVALID_CATEGORY_ID: `Invalid category Id`,
  INVALID_UPDATED_CATEGORY_ID: `Invalid updated category Id`,
  UNABLE_TO_UPDATE: `Unable to update profile data`,
  PHONE_NOT_VERIFIED: `Phone Number is not verified yet`,
  ALREADY_COMPLETED: `Profile is already updated.`,
  ALREADY_CATEGORY_ID: `Category id is already created.`,
  ALREADY_DELETED_CATEGORY_ID: `Category id is already deleted.`,
  INVALID_DATE_FORMAT: `Please enter a valid date of birth(YYYY-MM-DD)`,
  INACTIVE_ACCOUNT: `Invalid Email/Phone number or Password.`,
  PLEASE_VERIFY_EMAIL_OR_PHONE: `Please verify your email or phone number in order to login`,
  INVALID_PASSWORD: `Please enter a valid password`,
  INVALID_EMAIL_OR_PHONE: `Please enter a valid email or phone number`,
  PHONE_NOT_VERIFIED_RESEND: `Phone Number is not verified yet.Do you want to verify`,
  GMAIL_NOT_VERIFIED_RESEND: `Email is not verified yet.Do you want to verify`,
  TOKEN_MISSING: `Please provide social signup token`,
  PASSWORD_MISSING: `Please provide password.`,
  LOGIN_ENTITY_MISSING: `Please provide Login Entity`,
  MISSING_PASSWORD: `Please provide password.`,
  MISSING_CONFIRM_PASSWORD: `Please provide confirm password`,
  MISSING_COUNTRY_CODE: `Please provide country code`,
  MISSING_PHONE_NUMBER: `Please add valid phone number`,
  INVALID_COUNTRY_CODE: `Please enter valid country code.`,
  DEVICE_ALREADY_EXISTS: `Device Token already Exists.`,
  PLEASE_PROVIDE_CONTACTS_DATA: `Please provide Contacts Data.`,
  MISSING_CONTACT_NAME: `Missing Contact Name from array.`,
  MISSING_CONTACT_NUMBER: `Missing Contact Number from array.`,
  MISSING_OPTIONS_FIELD: `Missing Options Field`,
  MISSING_OPTIONS_VALUE: `Missing Options Values`,
  MISSING_COUNTY_FIELD: `Please provide county`,
  MISSING_STATE_FIELD: `Please provide state`,
  MISSING_DATE_OF_BIRTH: `Please provide Date of birth.`,
  MISSING_STATE_SYMBOL_FIELD: `Please provide state symbol.`,
  MISSING_GENDER_FIELD: `Please provide gender.`,
  INVALID_FIRST_NAME_LENGTH: `Max 15 characters are allowed for First /Last Name`,
  INVALID_IMAGE_FORMAT: `Please provide media format in png, jpg, jpeg or mp4`,
  INVALID_ENTITY_TYPE: `Please provide entity type in question, profile-photo, post`,
  MAXIMUM_FILE_SIZE: `The maximum file size can be up to 10 mb`,
  UNABLE_TO_VERIFY_TOKEN: `Unable to verify Token`,
  PHONER_NUMBER_MUST_BE_INTERGER: `Phone number must be in number format.`,
  EMAIL_ALREADY_EXISTS: `Please enter a new email.This email is already exists.`,
  MISSING_DATE_FIELD: `Date Field is missing.Please provide date.`,
  INVALID_DATE: `Please provide a valid date.`,
  DATE_MUST_BE_MILISECONDS: `Please provide date in milisecond format.`,
  INACTIVE_FORGOT: `Your email or phone number is not verified yet,Please verify your email or phone number and try again later.`,
  EMAIL_NOT_VERIFIED: `Email is not verified yet.`,
  INVALID_EMAIL: `Please provide valid email.`,
  EMAIL_NOT_EXISTED: `No account exists with this email.`,
  TOKEN_NOT_EXISTED: `No account exists with this token.`,
  ADD_UPDATED_PASSWORD: `Your new password cannot be the same one.Please update the new one.`,
  INVALID_TYPE: `Please provide valid forgot password type(1: Email/2: Phone number)`,
  SETUP_PASSWORD: `You have not setup your password.In order to login please setup your password.`,
  NOT_ALLOWED_DATE: `Please select today date or less than today.Future Date are not allowed.`,
  ONLY_CURRENT_YEAR_DATE_ALLOWED: `Date Interval must be only 1 year.`,
  MISSING_DEVICE_TOKEN: `Please provide device token.`,
  INVALID_QUESTION_LENGTH: `Question title must be at least 50 characters.`,
  ALREADY_ASSOCIATED_WITH_GOOGLE: `Your account is associated with Google login, Please try login with google login.`,
  ALREADY_ASSOCIATED_WITH_APPLE: `Your account is associated with Apple login, Please try login with Apple login.`,
  ALREADY_ASSOCIATED_WITH_GOOGLE_SIGNUP: `This email is already associated with google sign in, please login by google.`,
  ALREADY_ASSOCIATED_WITH_APPLE_SIGNUP: `This email is already associated with apple sign in, please login by apple.`,
  MISSING_EMAIL: `Please provide email.`,
  INVALID_TOKEN_SIGNATURE: `Invalid Token Signature`,
  INVALID_QUESTION_ID: `Invalid Question Id.`,
  DELETED_QUESTION: `We're sorry. This question was deleted`,
  ALREADY_ANSWERED_SAME_OPTION: `As you have already voted this question.So you are not allowed to vote it again.`,
  MISSING_ANSWER_REASON: `Missing Answer Reason.`,
  INVALID_ANSWER_LENGTH: `Please provide reason at least 150 characters.`,
  USER_NAME_ALREADY_EXISTS: `Please enter a new user name as this user name is already exists.`,
  MISSING_IMAGE: `Please provide image.`,
  INVALID_WEBSITE_URL: `Please enter a valid website URL.`,
  INVALID_GENDER_VALUE: `Please enter a valid gender Value (0: Male/1: Female/2: Prefer not to say)`,
  UPDATED_GENDER_VALUE: `Please update a valid gender Value (0: Male/1: Female/2: Prefer not to say)`,
  INVALID_SUBSCRIPTION_VALUE: `Please enter a valid subscription Value (1: Active/2: Deactive/3: Cancel)`,
  INVALID_KYC_STATUS: `Please enter a valid kyc status (1: Approve/2: Reject)`,
  ALREADY_ACTIVE_SUBSCRIPTION: `As you have already active subscription.`,
  ALREADY_INACTIVE_SUBSCRIPTION: `As you have already inactive subscription.`,
  ALREADY_APPROVE_KYC: `As you have already approve kyc.`,
  ALREADY_REJECT_KYC: `As you have already reject kyc.`,
  ALREADY_CANCELLED_SUBSCRIPTION: `As you have already cancelled subscription.`,
  NOT_SHARED_MESSAGE: `As you have not answered this question so you are not allowed to share.`,
  ALREADY_SHARED: `As you have already shared this question.So you are not allowed to share it again.`,
  MAXIMUM_LIMIT_BIO: `The maximum allowed limit of bio will be up to 500 characters.`,
  ENTER_DIFFERENT_PHONE_NUMBER: `Please enter different phone number.As you are using the same phone number.`,
  ENTER_DIFFERENT_EMAIL: `Please enter different email.As you are using the same email.`,
  ALREADY_FOLLOWING: `As you are already following this user.You can not follow again.`,
  REQUEST_ALREADY_SENT: `As you have already send the follow request.So you cannot send it again.`,
  CANT_UNFOLLOW: `As you have not following the user.So you cannot unfollow him.`,
  MAXIMUM_LIMIT_SHARE_MESSAGE: `The maximum limit of share message is upto 150 characters`,
  MISSING_SEARCH_FIELD: `Please provide search field.`,
  MAXIMUM_LENGTH_FIELD: `The maximum limit of search field is up to 5 characters.`,
  MAXIMUM_USERS_ALLOWED_MENTIONS: `Maximum only 5 users allowed in a comment.`,
  INVALID_COMMENT_QUESTION_ID: `Invalid Comment or question Id`,
  COMMENT_NOT_BELONGS: `This comment  is not belongs to you.`,
  COMMENT_ALREADY_DELETED: `Comment is already deleted.`,
  INVALID_FOLLOWED_BY_ID: `Invalid followed by Id.`,
  INVALID_FOLLOWED_TO_ID: `Invalid followed to Id.`,
  UNVABLE_TO_CREATE_LINK: `Unable to create dynamic link.Please try later.`,
  OLD_PASSWORD_MISMATCH: `Please enter the correct old password.`,
  PASSWORD_SAME_AS_OLD: `New password can not be same as old password.`,
  UNABLE_TO_LIKE: `Unable to like post!! Please try later.`,
  ALREADY_LIKED: `You have already liked this post. So you can not like it again`,
  INVALID_PASSWORD_FORMAT: `Password must be at least 8 characters, one special characters, one upper case, one lower case`,
  USER_ALREADY_DELETED: `Account is already deleted.`,
  UNABLE_TO_UPDATE_NOTIFICATION_SETTING: `Invalid Device token`,
  ALREADY_REPORTED_COMMENT: `This comment is already is reported by you.So you cannot report again.`,
  MISSING_REPORT_REASON: `Please provide report reason id or other reason.`,
  CANNOT_REPORT_OWN_COMMENT: `You can not report your own comment.`,
  BLOCKED_USER: `You have blocked by the question created by.`,
  BLOCKED_OTHER_PROFILE: `You’re Blocked.`,
  ALREADY_BLOCKED: `You have already blocked or you have blocked by the user.`,
  ALREADY_UNBLOCKED: `You have already unblocked or you have unblocked by the user.`,
  MISSING_USER_ID: `Missing User id`,
  ALREADY_REPORTED_POST: `This post is already reported by you.Hence you can not report it again.`,
  MISSING_COUNTY_STATE: `Please set your county, state, state symbol and gender in order to save your answer.`,
  PLEASE_ENTER_VALID_EMAIL: `Please enter a valid email.`,
  INVALID_NOTIFICATION_ID: `Please provide valid notification id.`,
  INVALID_COMMENT_ID: `Invalid Comment Id.`,
  INVALID_REPORTED_ID: `Invalid Reported Id.`,
  INVALID_LATITUDE: `Invalid latitude.`,
  INVALID_LONGITUDE: `Invalid longitude.`,
  INVALID_SUBSCRIBED_TO: `Invalid subscribed to`,
  VERIFICATION_REQUEST_NOT_ALLOWED: `Another request within 30 days is not allowed.`,
  VERIFICATION_REQUEST_NOT_FOUND: "Verification request not found",
  UNABLE_TO_UPDATE_CONTACT_SYNCING_SETTING: `Unable to update the status.`,
  ALREADY_REMOVED: `This user is already removed from the list.`,
  ACCOUNT_NOT_EXIST: "Account does not exist",
  QUESTION_ALREADY_EXISTS: `Question you want to create already exists.`,
  ALREADY_SUBSCRIBED_TO_USER: `Already subscribed to this user.`,
  USER_NOT_SUBSCRIBED: `You have not subscribed to this user.`,
  ALREADY_REPORTED_USER: `This user is already reported by you.Hence you can not report it again.`,
  MISSING_TYPE_VALUE: `Please provide type value`,
  SEARCH_SERVICE_NOT_AVAILABLE: `Seems like search service is not available.Please try later.`,
  INVALID_PARENT_ID: `Invalid Parent id.`,
  INVALID_CONTACT_NUMBERS: `Invalid contact numbers.`,
  CANNOT_REPORT_OWN_USER: `Sorry! You can not report to yourself!`,
  MISSING_NAME: `Please provide name`,
  MISSING_REDIRECT_URL: `Please provide redirect url`,
  MISSING_KYC_STATUS: `Please provide kyc status`,
  MISSING_UNIQUE_ID: `Please provide unique id`,
  MISSING_NOTIFICATION_ID: `Please provide notification id`,
  ALREADY_EXITS_SUCCESS: `User already in search suggestion lists`,
  MISSING_BLOCK_ID: `Please provide block id`,
  INVALID_BLOCK_ID: `Invalid block id.`,
  INVALID_FOLLOW_REQUEST_ID: `Invalid follow request id.`,
  USER_NOT_SEND_REQUEST: `User not send this user to follow request`,
  ALREADY_STATUS_UPDATED: `Status Already Updated Successfully`,
  INVALID_UNIQUE_ID: `Invalid Unique id.`,
  MISSING_OTHER_PROFILE_DATA: `Not present state, state_symbol, city, gender, address, zip code`,
  ALREADY_FOLLOW_REQUEST: `As you have already accepted the follow request.So you cannot send it again.`,
  ALREADY_UNFOLLOW_REQUEST: `Seems like follow request is not available.Please send follow request.`,
  ACCOUNT_SUSPEND: `This account is suspended.`,
  WRONG_USER_NAME: `Wrong username.Username can only have: Uppercase Letters (A-Z), Lowercase Letters (a-z), Numbers (0-9), Dots (.), Underscores (_)`,
};

const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: `Signup Successful`,
  OTP_SENT_SUCCESS: `OTP Sent Successfully`,
  PROFILE_DETAILS_UPDATED: `Profile Details Updated Successfully`,
  LOGIN_SUCCESS: `Login Successfully`,
  KYC_SUCCESS: `KYC Token Details`,
  KYC_VERIFY_SUCCESS: `KYC Details Added Successfully!`,
  KYC_STATUS_SUCCESS: `KYC Status Approved Successfully!`,
  KYC_STATUS_REJECT: `KYC Status Rejected Successfully!`,
  GET_KYC_VERIFY_SUCCESS: `KYC Verify Details!`,
  CONTACTS_SAVED: `Contacts Saved Successfully`,
  GET_SUCCESS: `User added in search suggestion lists`,
  UPDATED_CATEGORY: `Category updated in category lists`,
  OTP_VERIFIED_SUCCESS: `OTP Verified Successfully.`,
  QUESTION_ADDED: `Question Added Successfully`,
  PHOTO_UPLOAD_SUCCESS: `Image Uploaded Successfully.`,
  MEDIA_UPLOAD_SUCCESS: `Media Uploaded Successfully.`,
  FORGOT_PASSWORD_LINK_SENT: `Forgot Password Link Sent Successfully.`,
  LOGOUT_SUCCESS: `Logout Done Successfully`,
  PASSWORD_UPDATED: `Password Updated Successfully.`,
  EMAIL_VERIFICATION_LINK_SENT: `Email Verification Link Sent Successfully.`,
  DATA_FOUND: `Data Found Successfully.`,
  ANSWER_SAVED_SUCCESSFULLY: `Answer Saved Successfully.`,
  PROFILE_UPDATED: `Profile Updated Successfully.`,
  SUBSCRIPTION_ACTIVE: `Subscription Active Successfully.`,
  SUBSCRIPTION_INACTIVE: `Subscription Inactive Successfully.`,
  SUBSCRIPTION_CANCELLED: `Subscription Cancelled Successfully.`,
  ACCOUNT_PRIVACY_UPDATED: `Account Privacy Updated Successfully.`,
  SUGGESTED_FRIEND_SKIPPED: `Suggested Friend Skipped Successfully.`,
  DEVICE_TOKEN_UPDATED: `Device Token Updated Successfully.`,
  QUESTION_SHARED: `Question Shared Successfully.`,
  FOLLOWED_SUCCESS: `User Followed Successfully.`,
  STATUS_UPDATED: `Status Updated Successfully`,
  COMMENT_DELETED: `Comment Deleted Successfully.`,
  COMMENT_SUCCESS: `Comment Created Successfully.`,
  PASSWORD_CHANGED: `Password Changed Successfully.`,
  DELETE_ACCOUNT: `Your account has been deleted Successfully.`,
  UNFOLLOWED_SUCCESS: `User Unfollowed Successfully.`,
  SETTING_UPDATED_SUCCESS: `Settings updated successfully`,
  REQUEST_ACCEPTED: `Request Accepted Successfully.`,
  REQUEST_REJECTED: `Request Rejected Successfully.`,
  COMMENT_REPORTED: `Comment Reported Successfully.`,
  BLOCKED_SUCCESS: `User blocked Successfully.`,
  UNBLOCKED_SUCCESS: `User Unblocked successfully.`,
  POST_REPORTED: `Post reported Successfully.`,
  VERIFICATION_REQUEST_SUCCESS: `Request for verification sent successfully.`,
  REMOVED_SUCCESSFULLY: `User removed from the list successfully.`,
  REQUEST_SUCCESS: `Request Success.`,
  USER_SUBSCRIBED: `User Subscribed Successfully.`,
  USER_UNSUBSCRIBED: `User Unsubscribed Successfully.`,
  GENDER_SHOW: `User Show Gender Actived Successfully.`,
  GENDER_HIDE: `User Show Gender Inactived Successfully.`,
  USER_REPORTED: `User reported Successfully.`,
  CATEGORY_ADDED: `Category added Successfully.`,
  HEALTH_CHECK: `Health check data get Successfully`,
  NOTIFICATION_DATA: `Notification data get Successfully`,
};

const QUESTION_NEW_FORMAT_CONDITION = {
  MY_ACTIVITY_DATA: "GetMyActivityNewData",
};

const DEVICE_TYPE = {
  ANDROID: 1,
  IOS: 2,
  WEB: 3,
};

const LOGIN_TYPE = {
  EMAIL: 1,
  PHONE_NUMBER: 2,
  GMAIL: 3,
  APPLE: 4,
};

const SOCIAL_LOGIN = {
  GMAIL: 1,
  APPLE: 2,
};

const SIGNUP_TYPE = {
  EMAIL: 1,
  PHONE_NUMBER: 2,
  GMAIL: 3,
  APPLE: 4,
};

const FORGOT_PASSWORD_TYPE = {
  EMAIL: 1,
  PHONE_NUMBER: 2,
};

const VERIFY_OTP_TYPE = {
  ON_SIGNUP: 1,
  ON_FORGOT_PASSWORD: 2,
};

const FOLLOW_REQUEST_STATUS = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
};

const FOLLOW_TYPE = {
  FOLLOW: 1,
  UNFOLLOW: 2,
};

const FOLLOW_ACTION_TYPE = {
  ACCEPT: 1,
  REJECT: 2,
};

const GET_COMMENT_TYPE = {
  QUESTION_TYPE: 1,
  SHARED_TYPE: 2,
};

const TRENDING_TYPE = {
  ADMIN: 1,
  USER: 2,
};

const LIKE_TYPE = {
  LIKE: 1,
  DISLIKE: 2,
};

const REPORT_STATUS = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
};

const THRESHOLD_TYPE = {
  REPORT_COMMENT: 1,
  REPORT_POST: 2,
  GROUP_LIKES: 3,
  GROUP_COMMENTS: 4,
  GROUP_MENTIONED_USERS: 5,
};

const TRENDING_CATEGORY_ID = "c7beef3c-200e-4ec7-91d5-77e7867d25c0";

const DONATION_CATEGORY_ID = "02edce09-0768-46b7-9dd2-0c9cb3672cba";

const WT_CATEGORY_ID = "781d62bf-9864-40a9-8baf-4d68c9327035";

const ALL_CATEGORY_ID = "687a12bc-9182-4c24-b481-f97e8ce8ebe3";

const TRENDING_THRESHOLD_TYPE = {
  VOTE_COUNT: 1,
  LIKES_COUNT: 2,
  COMMENT_COUNT: 3,
};

const QUESTION_EXPIRATION_TYPE = {
  NORMAL_POST: 1,
  TRENDING_POST: 2,
};

const REPLY_SCROLL_TYPE = {
  NEXT: 1,
  PREVIOUS: 2,
};

const VERIFICATION_REQUEST_STATUS = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  RESUBMIT: 4,
};

const QUESTION_TYPE = {
  MCQ: 1,
  STAR: 2,
};

const generateOptions = () => {
  return [1, 2, 3, 4, 5].map((item) => {
    return {
      name: `${item}-STAR`,
      option: item,
    };
  });
};

const VIDEO_STATUS = {
  AVAILABLE: 2,
  UNAVAILABLE: 1,
};

const GENDER = {
  MALE: 0,
  FEMALE: 1,
  PREFER_NOT_TO_SAY: 2,
  // OTHER: 3,
};

const SUBSCRIPTION = {
  ACTIVE: 1,
  INACTIVE: 2,
  CANCELLED: 3,
};

const KYC = {
  APPROVE: 1,
  REJECT: 2,
};

const RATING_QUESTION_OPTION = generateOptions();

const QUESTION_COVER_TYPE = {
  MEDIA: 1,
  LINK: 2,
};

const REPORT_MASTER_TYPE = {
  USER_REPORT: 1,
  POST_REPORT: 2,
};

module.exports = {
  ERROR_MESSSAGES,
  HTTP_CODES,
  SALT_ROUNDS,
  ROLE_IDS,
  SUCCESS_MESSAGES,
  ACCOUNT_TYPE,
  ORM_ERRORS,
  DEVICE_TYPE,
  LOGIN_TYPE,
  SOCIAL_LOGIN,
  SIGNUP_TYPE,
  FORGOT_PASSWORD_TYPE,
  VERIFY_OTP_TYPE,
  FOLLOW_REQUEST_STATUS,
  FOLLOW_TYPE,
  FOLLOW_ACTION_TYPE,
  GET_COMMENT_TYPE,
  TRENDING_TYPE,
  LIKE_TYPE,
  TRENDING_CATEGORY_ID,
  REPORT_STATUS,
  THRESHOLD_TYPE,
  DONATION_CATEGORY_ID,
  WT_CATEGORY_ID,
  ALL_CATEGORY_ID,
  TRENDING_THRESHOLD_TYPE,
  QUESTION_EXPIRATION_TYPE,
  REPLY_SCROLL_TYPE,
  VERIFICATION_REQUEST_STATUS,
  QUESTION_TYPE,
  RATING_QUESTION_OPTION,
  VIDEO_STATUS,
  GENDER,
  QUESTION_COVER_TYPE,
  REPORT_MASTER_TYPE,
  SUBSCRIPTION,
  KYC,
  QUESTION_NEW_FORMAT_CONDITION,
};
