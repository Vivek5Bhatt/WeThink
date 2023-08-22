const yup = require("yup");

const enableDisableCommentSchema = yup.object().shape({
    id: yup.string().required(),
    status: yup.boolean().required(),
    type: yup.number().min(1).max(2).required()
})

const postCommentSchema = yup.object().shape({
    question_id: yup.string().required(),
    comment: yup.string().min(1).max(500).required(),
})

const getCommentListsSchema = yup.object().shape({
    id: yup.string().required(),
    offset: yup.number().required(),
    limit: yup.number().min(1).required(),
    get_comment_type: yup.number().min(1).max(2).required()
})

const getReplyCommentListsSchema = yup.object().shape({
    parent_id: yup.string().required(),
    offset: yup.number().required(),
    limit: yup.number().min(1).required()
})

const paginationSchema = yup.object().shape({
    page_number: yup.number().min(1).required(),
    limit: yup.number().min(1).required()
})

const deleteCommentSchema = yup.object().shape({
    question_id: yup.string().required(),
    comment_id: yup.string().required(),
})

const getDynamicLinkSchema = yup.object().shape({
    question_id: yup.string().required(),
    socialTitle: yup.string(),
    socialDescription: yup.string(),
    socialImageLink: yup.string()
})

const likePostSchema = yup.object().shape({
    question_id: yup.string().required(),
    type: yup.number().required().min(1).max(2)
})

const getTrendingQuestionSchema = yup.object().shape({
    page_number: yup.number().min(1).required(),
    limit: yup.number().min(1).required()
})

const reportCommentSchema = yup.object().shape({
    question_id: yup.string().required(),
    comment_id: yup.string().required(),
})

const reportPostSchema = yup.object().shape({
    question_id: yup.string().required(),
})

module.exports = {
    enableDisableCommentSchema,
    postCommentSchema,
    getCommentListsSchema,
    getReplyCommentListsSchema,
    paginationSchema,
    deleteCommentSchema,
    getDynamicLinkSchema,
    likePostSchema,
    getTrendingQuestionSchema,
    reportCommentSchema,
    reportPostSchema
}