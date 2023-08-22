const yup = require("yup");
const { REPLY_TYPE, REPORT_MASTER_TYPE } = require('../../utils/Constants');

const addToReportMasterSchema = yup.object().shape({
  name: yup.string().required().max(30),
  type: yup.number().required().min(1),
});


const getReportMasterSchema = yup.object().shape({
  page_number: yup.number().required().min(1),
  limit: yup.number().required().min(1),
  type: yup.number().oneOf([REPORT_MASTER_TYPE.POST_REPORT, REPORT_MASTER_TYPE.USER_REPORT])
});

const updateReportStatusSchema = yup.object().shape({
  id: yup.string().required(),
  report_status: yup.number().required().min(2).max(3),
});

const updateToReportMasterSchema = yup.object().shape({
  name: yup.string().required().max(30),
  id: yup.string().required(),
  type: yup.number()
});

const reporteQuestionDetailSchema = yup.object().shape({
  id: yup.string().required(),
  search: yup.string(),
  sort: yup.number().min(1).max(2)
});

const updateReportQuestionStatusSchema = yup.object().shape({
  id: yup.string().required(),
  report_status: yup.number().required().min(2).max(3),
  reject_reason: yup.string().max(250)
});

const getReportedUserDetailSchema = yup.object().shape({
  user_id: yup.string().required(),
  page_number: yup.number().required().min(1),
  limit: yup.number().required().min(1)
});

const reportedUserActionSchema = yup.object().shape({
  report_id: yup.string().required(),
  report_status: yup.number().required().min(2).max(3),
});

const reportReplySchema = yup.object().shape({
  reported_user_id: yup.string(),
  reported_question_id: yup.string(),
  reply_message: yup.string().required().min(5).max(1000),
  type: yup.number().required().oneOf([REPLY_TYPE.REPLY_ALL, REPLY_TYPE.SINGLE_REPLY])
})

module.exports = {
  addToReportMasterSchema,
  getReportMasterSchema,
  updateReportStatusSchema,
  updateToReportMasterSchema,
  reporteQuestionDetailSchema,
  updateReportQuestionStatusSchema,
  getReportedUserDetailSchema,
  reportedUserActionSchema,
  reportReplySchema
}