const { HTTP_CODES } = require('../utils/Constants')
const ResponseHandler = require('../helpers/Response')
const Logger = require('../helpers/Logger')

class ErrorHandler {
    unHandeledCustomError(res, error) {
        Logger.error(error)
        if (error && error.parent && error.parent.code === "22P02") {
            return ResponseHandler(res, HTTP_CODES.BAD_REQUEST, `Invalid Id format is provided in request.Please provide in UUID format`)
        }
        if (!error.errorMessage || !error.statusCode) {
            return ResponseHandler(res, HTTP_CODES.INTERNAL_SERVER_ERROR, `Internal Server Error`)
        }
        else {
            return ResponseHandler(res, error.statusCode, error.errorMessage)
        }
    }

    customError(errorMessage, statusCode) {
        return {
            statusCode: statusCode,
            errorMessage: errorMessage
        }
    }

    customError(errorMessage, statusCode) {
        return {
            statusCode: statusCode,
            errorMessage: errorMessage,
        };
    }
}

module.exports = ErrorHandler;
