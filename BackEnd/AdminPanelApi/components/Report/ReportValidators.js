const ReportSchemaValidators = require('./ReportSchemaValidators')
const { HTTP_CODES, ERROR_MESSSAGES } = require('../../utils/Constants')
const ErrorHandler = require('../../helpers/ErrorHandler')


const addToReportMasterValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.addToReportMasterSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const getReportMasterListValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.getReportMasterSchema
            .validate(req.query)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const updateReportStatusValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.updateReportStatusSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const updateReportQuestionStatusValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.updateReportQuestionStatusSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const updateToReportMasterValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.updateToReportMasterSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const reporteQuestionDetailValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.reporteQuestionDetailSchema
            .validate(req.query)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const getReportedUserDetailValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.getReportedUserDetailSchema
            .validate(req.query)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}


const reportedUserActionValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.reportedUserActionSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}


const reportReplyValidators = async (req, res, next) => {
    try {
        const isValid = await ReportSchemaValidators.reportReplySchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else {
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

module.exports = {
    addToReportMasterValidators,
    getReportMasterListValidators,
    updateReportStatusValidators,
    updateToReportMasterValidators,
    reporteQuestionDetailValidators,
    updateReportQuestionStatusValidators,
    getReportedUserDetailValidators,
    reportedUserActionValidators,
    reportReplyValidators
}