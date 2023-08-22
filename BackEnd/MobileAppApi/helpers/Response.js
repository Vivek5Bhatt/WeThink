'use strict';

module.exports = function (res, responseCode, message, data) {
    return res.status(responseCode).json({
        response_code: responseCode,
        message: message,
        result: data || {}
    })
}