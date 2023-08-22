const ACCOUNT_TYPE = {
    PUBLIC: 1,
    PRIVATE: 2
}

const SALT_ROUNDS = 10

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
    USER: 2
}

const ORM_ERRORS = {
    ALREADY_EXISTS: "23505"
}

const ERROR_MESSSAGES = {
    PASSWORD_MISMATCH: `Password and Confirm Password doesn't match`,
    PHONE_NUMBER_LENGTH: `Please enter valid phone number between 10-15 digits`,
    PASSWORD_LENGTH: `Please enter valid password between 8-12 characters`,
    PHONE_ALREADY_EXISTS: `Please enter a new phone number.As this phone number is already exists.`,
    UNABLE_TO_SIGNUP: `Unable To Signup!!Please try again`,
    INVALID_PHONE_NUMBER: `Invalid Phone Number!! Please enter a valid phone number`,
    OTP_MUST_UNIQUE: `Otp must be unique`,
    OTP_MUST_BE_LENGTH: `Otp must be of 6 digits`,
    INVALID_OTP: `Please Enter a Valid OTP number`,
    OTP_MUST_BE_INTEGER: `Otp must be in number`,
    UNAUTHORIZED: `You are unauthourized to access`,
    INVALID_USER_ID: `Invalid User Id`,
    INVALID_ID: `Invalid Id`,
    USER_ID_NOT_EXIST: `User Id Not Exist.`,
    UNABLE_TO_UPDATE: `Unable to update profile data`,
    PHONE_NOT_VERIFIED: `Phone Number is not verified yet`,
    ALREADY_COMPLETED: `Profile is already updated.`,
    INVALID_DATE_FORMAT: `Please enter a valid date of birth`,
    INACTIVE_ACCOUNT: `Invalid Email/Phone number or Password.`,
    PLEASE_VERIFY_EMAIL_OR_PHONE: `Please verify your email or phone number in order to login`,
    INVALID_PASSWORD: `Please enter a valid password`,
    INVALID_EMAIL_OR_PHONE: `Please enter a valid email.`,
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
    INVALID_FIRST_NAME_LENGTH: `Max 15 characters are allowed for First /Last Name`,
    INVALID_IMAGE_FORMAT: `Please provide image format in png,jpg or jpeg`,
    MAXIMUM_FILE_SIZE: `The maximum file size can be up to 5 mb`,
    UNABLE_TO_VERIFY_TOKEN: `Unable to verify Token`,
    PHONER_NUMBER_MUST_BE_INTERGER: `Phone number must be in number format.`,
    EMAIL_ALREADY_EXISTS: `Please enter a new email id.`,
    ONLY_ADMIN_IS_SUCCESS: `Only Admin is allowed to login.`,
    UNABLE_TO_RESET_PASSWORD: `Sorry!! We are unable to reset your password as you account is not active any more.`,
    ADD_UPDATED_PASSWORD: `Your new password can't be the old one.Please try to add a new password.`,
    RESET_PASSWORD_LINK_EXPIRED: `Your Reset Password Link Has been expired.`,
    UNABLE_TO_REMOVE_QUESTION: `Unable to remove questions!!.Please try after some time.`,
    EMAIL_VERIFICATION_EXPIRED: `Your email verification Link has been expired.`,
    UNABLE_TO_VERIFY_EMAIL: `Sorry!! We are unable to verify your email as you account is not active any more.`,
    MISSING_QUESTION_ID: `Please provide question id.`,
    MISSING_IMAGE: `Please provide image.`,
    INVALID_QUESTION_ID: `Invalid Question Id.`,
    REPORT_REASON_EXISTS: `This report reason is already exists.`,
    INVALID_REPORT_MASTER_ID: `Invalid Report Master id.`,
    UNABLE_TO_UPDATE_STATUS: `Unable to update status.`,
    INVALID_VERIFICTION_OF_USER: `This user is not applicable for verification yet.`,
    INVALID_ACCOUNT_STATUS: `Account status must be 1: Account suspend/2: Account Delete.`,
    INVALID_REPORT_ID: `Invalid Report id.`,
    REPORT_ACTION_NOT_ALLOWED: `Report action not allowed`,
    PROVIDE_QUESTION_ID_OR_USER_ID: `Please provide either question id or user id.`,
    MISSING_USER_ID: `Please provide user id`,
    ALREADY_ACCOUNT_SUSPEND: `User account is already suspended.`,
    ALREADY_ACCOUNT_RESTORED: `User account is already restored.`,
    ALREADY_ACCOUNT_DELETED: `User account is already deleted.`,
}

const SUCCESS_MESSAGES = {
    SIGNUP_SUCCESS: `Signup Successful`,
    OTP_SENT_SUCCESS: `Otp Sent Successfully`,
    PROFILE_DETAILS_UPDATED: `Profile Details Updated Successfully`,
    LOGIN_SUCCESS: `Login Successfully`,
    CONTACTS_SAVED: `Contacts Saved Successfully`,
    GET_SUCCESS: `The data is`,
    OTP_VERIFIED_SUCCESS: `Otp Verified Successfully.`,
    QUESTION_ADDED: `Question Added Successfully`,
    PHOTO_UPLOAD_SUCCESS: `Image Uploaded Successfully.`,
    FORGOT_PASSWORD_LINK: `Forgot Password Link Sent Successfully.`,
    PASSWORD_UPDATED_SUCCESS: `Password Updated Successfully.`,
    LOGOUT_SUCCESS: `Logout Done Successfully.`,
    QUESTION_DELETED_SUCCESS: `Question Deleted Successfully.`,
    EMAIL_VERIFIED_SUCCESS: `Your Email has verified successfully.`,
    DATA_FOUND: `Data Fetched Successfully`,
    DATA_ADDED_SUCCESS: `Report Master reason data added successfully.`,
    DATA_UPDATED_SUCCESS: `Report Master reason data updated successfully.`,
    REPORT_MASTER_DELETED: `Report Master reason deleted successfully.`,
    REPORTED_DATA_FOUND: `Reported Comments Found Successfully.`,
    REPORTED_DATA_QUESTION_FOUND: `Reported Questions Found Successfully.`,
    REPORT_MASTER_UPDATED: `Report Master reason updated successfully.`,
    REPORT_STATUS: `Report Status Updated Successfully.`,
    USERS_ACCOUNT_STATUS: `Status updated successfully`,
    REPORT_REPLY: `Report reply saved successfully!.`,
    ACCOUNT_SUSPEND: `User account suspended successfully!.`,
    ACCOUNT_DELETED: `User account deleted successfully!.`,
    ACCOUNT_RESTORED: `User account restored successfully!.`,
    HEALTH_CHECK: `Health check data get Successfully`
}

const DEVICE_TYPE = {
    ANDROID: 1,
    IOS: 2,
    WEB: 3
}

const LOGIN_TYPE = {
    EMAIL: 1,
    PHONE_NUMBER: 2,
    GMAIL: 3,
    APPLE: 4
}

const SOCIAL_LOGIN = {
    GMAIL: 1,
    APPLE: 2
}

const SIGNUP_TYPE = {
    EMAIL: 1,
    PHONE_NUMBER: 2,
    GMAIL: 3,
    APPLE: 4
}

const REPORT_STATUS = {
    PENDING: 1,
    ACCEPTED: 2,
    REJECTED: 3
}

const VERIFICATION_REQUEST_STATUS = {
    PENDING: 1,
    ACCEPTED: 2,
    REJECTED: 3,
    RESUBMIT: 4
}

const TRENDING_CATEGORY_ID = 'c7beef3c-200e-4ec7-91d5-77e7867d25c0'

const DONATION_CATEGORY_ID = '02edce09-0768-46b7-9dd2-0c9cb3672cba'

const WT_CATEGORY_ID = '781d62bf-9864-40a9-8baf-4d68c9327035'

const ALL_CATEGORY_ID = '687a12bc-9182-4c24-b481-f97e8ce8ebe3';

const SORT_TYPE = {
    ASC: 1,
    DESC: 2
}

const QUESTION_TYPE = {
    MCQ: 1,
    STAR_RATING: 2
}

const REPORTED_USER_ADMIN_STATUS = {
    ACCEPTED: 1,
    REJECTED: 2
}

const REPLY_TYPE = {
    SINGLE_REPLY: 1,
    REPLY_ALL: 2
}

const REPORT_MASTER_TYPE = {
    USER_REPORT: 1,
    POST_REPORT: 2
}

const QUESTION_COVER_TYPE = {
    MEDIA: 1,
    LINK: 2
}

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
    REPORT_STATUS,
    TRENDING_CATEGORY_ID,
    WT_CATEGORY_ID,
    ALL_CATEGORY_ID,
    DONATION_CATEGORY_ID,
    SORT_TYPE,
    VERIFICATION_REQUEST_STATUS,
    QUESTION_TYPE,
    REPORTED_USER_ADMIN_STATUS,
    REPLY_TYPE,
    REPORT_MASTER_TYPE,
    QUESTION_COVER_TYPE
}