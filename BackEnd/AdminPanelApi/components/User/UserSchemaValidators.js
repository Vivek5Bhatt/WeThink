const yup = require("yup");
const { REPLY_TYPE } = require("../../utils/Constants");

const signupSchema = yup.object().shape({
  signup_type: yup.number().min(1).max(3)
});

const sendOtpSchema = yup.object().shape({
  country_code: yup.string().required(),
  phone_number: yup.string().min(10).max(15)
});

const verifyOtpSchema = yup.object().shape({
  otp: yup.string().min(6).max(6)
});

const profileUpdateOnSignupSchema = yup.object().shape({
  first_name: yup.string().required().max(15),
  last_name: yup.string().required().max(15),
  email: yup.string().email().required(),
  date_of_birth: yup.string().required(),
  state: yup.string().required(20),
  county: yup.string().required(20),
  user_id: yup.string().required(),
  device_token: yup.string().required(),
  device_type: yup.string().min(1).max(3)
});

const loginSchema = yup.object().shape({
  password: yup.string().min(8).max(12),
  email: yup.string().email().required(),
})

const getContactsSchema = yup.object().shape({
  page_number: yup.number().min(1).required(),
  limit: yup.number().min(1).required(),
});

const getVerificationFormListSchema = yup.object().shape({
  page_number: yup.number().min(1).required(),
  limit: yup.number().min(1).required(),
  search: yup.string(),
  status: yup.number().oneOf([1, 2, 3, 4])
});

const addQuestionSchema = yup.object().shape({
  question_title: yup.string().min(5).required(),
  question_type: yup.string().min(1).max(2),
  category_id: yup.string().required(),
  answer_duration: yup.number().min(1).nullable(),
  question_cover_type: yup.number().min(1).max(2).nullable()
});

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email().required()
})

const resetPasswordSchema = yup.object().shape({
  password: yup.string().min(8).max(12),
  confirm_password: yup.string().min(8).max(12),
  token: yup.string().required()
})

const deleteQuestionSchema = yup.object().shape({
  question_id: yup.string().required()
})

const getProfileDataSchema = yup.object().shape({
  user_id: yup.string().required()
})

const getVerificationFormDataSchema = yup.object().shape({
  id: yup.string().required()
})

const profileActionSchema = yup.object().shape({
  user_id: yup.string().required(),
  account_status: yup.boolean().required(),
  reject_reason: yup.string().when(["account_status"], {
    is: false, then: yup.string().trim().max(500).required('Rejection reason is required')
  }),
})

const deleteSuspendSchema = yup.object().shape({
  user_id: yup.string().required(),
  account_status: yup.number().required(),
})

module.exports = {
  signupSchema,
  sendOtpSchema,
  verifyOtpSchema,
  profileUpdateOnSignupSchema,
  loginSchema,
  getContactsSchema,
  addQuestionSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  deleteQuestionSchema,
  getProfileDataSchema,
  profileActionSchema,
  getVerificationFormDataSchema,
  getVerificationFormListSchema,
  deleteSuspendSchema,
}