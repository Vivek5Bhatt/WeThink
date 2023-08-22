const VerificationSchemaValidators = require('./VerificationSchemaValidators')
const { HTTP_CODES } = require('../../utils/Constants')
const ErrorHandler = require('../../helpers/ErrorHandler');

const sendVerificationRequest = async (req, res, next) => {
    try {
        const isValid = await VerificationSchemaValidators.sendVerificationRequestSchema.validate(req.body)
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
    sendVerificationRequest
}