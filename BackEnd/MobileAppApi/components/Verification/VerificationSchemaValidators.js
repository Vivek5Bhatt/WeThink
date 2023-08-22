const yup = require("yup");

const sendVerificationRequestSchema = yup.object().shape({
  user_name: yup.string().min(1).max(60).required(),
  full_name: yup.string().min(1).max(100).required(),
  email: yup.string().required(),
  phone_number: yup.string().required().max(15),
  selfie_url: yup.string().max(255).required(),
  id_type: yup.string().required(),
  user_comment: yup.string()
});

module.exports = {
  sendVerificationRequestSchema
}