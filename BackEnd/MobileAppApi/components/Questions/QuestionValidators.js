const QuestionSchemaValidators = require("./QuestionSchemaValidators");
const { HTTP_CODES } = require("../../utils/Constants");
const ErrorHandler = require("../../helpers/ErrorHandler");

const enableDisableValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.enableDisableCommentSchema
      .validate(req.body)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const postCommentValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.postCommentSchema
      .validate(req.body)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const getCommentListValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.getCommentListsSchema
      .validate(req.query)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const getReplyCommentListValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.getReplyCommentListsSchema
      .validate(req.query)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const getMentionUsersValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.paginationSchema
      .validate(req.query)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const deleteCommentValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.deleteCommentSchema
      .validate(req.query)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const getDynamicLinkSchemaValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.getDynamicLinkSchema
      .validate(req.query)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const likePostValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.likePostSchema
      .validate(req.body)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const getTrendingQuestionValidators = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.getTrendingQuestionSchema
      .validate(req.query)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const reportCommentsValidtors = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.reportCommentSchema
      .validate(req.body)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

const reportPostValidtors = async (req, res, next) => {
  try {
    const isValid = await QuestionSchemaValidators.reportPostSchema
      .validate(req.body)
      .then((valid) => {
        return valid;
      })
      .catch((error) => {
        return error;
      });
    if (isValid.errors) {
      throw new ErrorHandler().customError(
        isValid.errors[0],
        HTTP_CODES.BAD_REQUEST
      );
    } else next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  enableDisableValidators,
  postCommentValidators,
  getCommentListValidators,
  getReplyCommentListValidators,
  getMentionUsersValidators,
  deleteCommentValidators,
  getDynamicLinkSchemaValidators,
  likePostValidators,
  getTrendingQuestionValidators,
  reportCommentsValidtors,
  reportPostValidtors,
};
