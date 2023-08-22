const yup = require("yup");
const { SIGNUP_TYPE } = require("../../utils/Constants");

const signupSchema = yup.object().shape({
  is_business_account: yup.boolean(),
  confirm_password: yup.string().when("signup_type", {
    is: (signup_type) =>
      signup_type === SIGNUP_TYPE.PHONE_NUMBER ||
      signup_type === SIGNUP_TYPE.EMAIL,
    then: yup
      .string()
      .oneOf(
        [yup.ref("password"), null],
        "Password & Confirm Password don't match."
      )
      .required(),
  }),
  password: yup.string().when("signup_type", {
    is: (signup_type) =>
      signup_type === SIGNUP_TYPE.PHONE_NUMBER ||
      signup_type === SIGNUP_TYPE.EMAIL,
    then: yup.string().min(8).required(),
  }),
  country_code: yup.string().when("signup_type", {
    is: (signup_type) => signup_type === SIGNUP_TYPE.PHONE_NUMBER,
    then: yup.string().min(2).max(4).required(),
  }),
  phone_number: yup.string().when("signup_type", {
    is: (signup_type) => signup_type === SIGNUP_TYPE.PHONE_NUMBER,
    then: yup.string().min(10).max(15).required(),
  }),
  email: yup.string().when("signup_type", {
    is: (signup_type) => signup_type === SIGNUP_TYPE.EMAIL,
    then: yup.string().email().required(),
  }),
  token: yup.string().when("signup_type", {
    is: (signup_type) =>
      signup_type === SIGNUP_TYPE.GMAIL || signup_type === SIGNUP_TYPE.APPLE,
    then: yup.string().required(),
  }),
  signup_type: yup.number().min(1).max(4),
  device_type: yup.string().min(1).max(3),
  date_of_birth: yup.string(),
  gender: yup.number().min(0).max(2),
});

const sendOtpSchema = yup.object().shape({
  country_code: yup.string().min(2).max(4),
  phone_number: yup.string().min(10).max(15),
  email: yup.string().email(),
});

const verifyOtpSchema = yup.object().shape({
  otp: yup.string().min(6).max(6).required(),
  user_id: yup.string().required(),
});

const profileUpdateOnSignupSchema = yup.object().shape({
  device_type: yup.string().min(1).max(3),
  device_token: yup.string().required(),
  date_of_birth: yup.string(),
  state_symbol: yup.string().required(),
  county: yup.string().required(),
  state: yup.string().required(),
  phone_number: yup.string().min(10).max(15),
  email: yup.string().email(),
  gender: yup.number().min(0).max(2),
  username: yup.string(),
  last_name: yup.string().required().max(15),
  first_name: yup.string().required().max(15),
  user_id: yup.string().required(),
});

const completeBusinessProfileSchema = yup.object().shape({
  state_symbol: yup.string().max(10),
  business_account_name: yup.string().required().max(50),
  business_account_category: yup.string().optional(),
  email: yup.string().email().required(),
  address: yup.string(),
  county: yup.string().max(50),
  state: yup.string(),
  city: yup.string(),
  business_longitude: yup.string(),
  business_latitude: yup.string(),
  device_token: yup.string().required(),
  device_type: yup.string().min(1).max(3).required(),
  title: yup.string(),
  website: yup.string().url(),
});

const loginSchema = yup.object().shape({
  first_name: yup.string().max(15),
  last_name: yup.string().max(15),
  date_of_birth: yup.string(),
  gender: yup.number().min(0).max(2),
  device_token: yup.string().required(),
  device_type: yup.string().min(1).max(3),
  login_type: yup.number().min(1).max(5),
});

const getContactsSchema = yup.object().shape({
  page_number: yup.number().min(1).required(),
  limit: yup.number().min(1).required(),
});

const getFollowingSchema = yup.object().shape({
  search: yup.string(),
  page_number: yup.number().min(1).required(),
  limit: yup.number().min(1).required(),
  user_id : yup.string()
});

const addCategorySchema = yup.object().shape({
  category_name: yup.string().required().max(20),
  category_id: yup.string().required(),
});

const updateCategorySchema = yup.object().shape({
  prefrence_order: yup.number(),
  category_name: yup.string().required().max(20),
  category_id: yup.string().required(),
});

const deleteCategorySchema = yup.object().shape({
  category_id: yup.string().required(),
});

const addQuestionSchema = yup.object().shape({
  question_title: yup.string().min(1).required(),
  question_type: yup.number().min(1).required(),
  category_id: yup.string().required(),
  image_url: yup.string().max(500),
  video_url: yup.string().max(500),
  video_thumbnail: yup.string().max(500),
});

const resetPasswordSchema = yup.object().shape({
  confirm_password: yup.string().required().min(8),
  password: yup.string().required().min(8),
  user_id: yup.string().required(),
});

const validateQuestionIdSchema = yup.object().shape({
  question_id: yup.string().required(),
});

const saveAnswerSchema = yup.object().shape({
  question_id: yup.string().required(),
  answer_id: yup.string().required(),
});

const updateProfileSchema = yup.object().shape({
  user_name: yup.string().max(15),
  email: yup.string().email(),
  first_name: yup.string().max(15),
  last_name: yup.string().max(15),
  bio: yup.string().max(500),
  date_of_birth: yup.string(),
  gender: yup.number().min(0).max(2),
  country_code: yup.string().min(2).max(4),
  phone_number: yup.string().min(10).max(15),
  website: yup.string().url(),
});

const accountSchema = yup.object().shape({
  account_type: yup.number().min(1).max(2),
});

const viewOtherProfileSchema = yup.object().shape({
  user_id: yup.string().required(),
  page_number: yup.number().min(1).required(),
  limit: yup.number().min(1).required(),
});

const viewOtherNewProfileSchema = yup.object().shape({
  user_id: yup.string().required(),
  page_number: yup.number().min(1).required(),
  limit: yup.number().min(1).required(),
});

const followUnfollowSchema = yup.object().shape({
  user_id: yup.string().required(),
  follow_type: yup.number().min(1).max(2).required(),
});

const followActionSchema = yup.object().shape({
  follow_request_id: yup.string().required(),
  action_type: yup.number().min(1).max(2).required(),
});

const changePasswordSchema = yup.object().shape({
  confirm_password: yup.string().required().min(8),
  password: yup.string().required().min(8),
  old_password: yup.string().required().min(8),
});

const enableDisableNotificationSchema = yup.object().shape({
  status: yup.boolean().required(),
});

const updateSeenNotificationSchema = yup.object().shape({
  notification_id: yup.string().required(),
});

const switchProfileSchema = yup.object().shape({
  user_id: yup.string().required(),
  device_token: yup.string().required(),
  device_type: yup.string().min(1).max(3),
});

const getSuggestedFriendSchema = yup.object().shape({
  page_number: yup.number().min(1).required(),
  limit: yup.number().min(1).required(),
  search: yup.string(),
  user_id: yup.string(),
});

const updateBusinessProfileSchema = yup.object().shape({
  business_account_name: yup.string().required().max(50),
  email: yup.string().email().required(),
  country_code: yup.string().min(2).max(4).required(),
  phone_number: yup.string().min(10).max(15),
  address: yup.string(),
  county: yup.string(),
  state: yup.string(),
  city: yup.string(),
  title: yup.string().max(100),
  bio: yup.string(),
  website: yup.string().url(),
  user_name: yup.string().required().max(15),
  business_longitude: yup.string(),
  business_latitude: yup.string(),
});

const updateContactSyncingSchema = yup.object().shape({
  status: yup.boolean().required(),
});

const genderShowSchema = yup.object().shape({
  toggle: yup.boolean().required(),
});

const searchUserSchema = yup.object().shape({
  page_number: yup.number().min(1).required(),
  limit: yup.number().min(1).required(),
  search: yup.string().required(),
});

const subscribeSchema = yup.object().shape({
  subscribe: yup.boolean().required(),
  subscribed_to: yup.string().required(),
});

const reportUserSchema = yup.object().shape({
  reported_to: yup.string().required(),
});

module.exports = {
  signupSchema,
  sendOtpSchema,
  verifyOtpSchema,
  profileUpdateOnSignupSchema,
  loginSchema,
  getContactsSchema,
  addQuestionSchema,
  resetPasswordSchema,
  validateQuestionIdSchema,
  saveAnswerSchema,
  updateProfileSchema,
  accountSchema,
  viewOtherProfileSchema,
  followUnfollowSchema,
  followActionSchema,
  changePasswordSchema,
  enableDisableNotificationSchema,
  updateSeenNotificationSchema,
  switchProfileSchema,
  completeBusinessProfileSchema,
  getSuggestedFriendSchema,
  updateBusinessProfileSchema,
  updateContactSyncingSchema,
  searchUserSchema,
  subscribeSchema,
  reportUserSchema,
  genderShowSchema,
  addCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  getFollowingSchema,
  viewOtherNewProfileSchema
};
