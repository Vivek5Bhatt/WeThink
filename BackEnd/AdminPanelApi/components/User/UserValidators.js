const UserSchemaValidators = require('./UserSchemaValidators')
const { HTTP_CODES, ERROR_MESSSAGES } = require('../../utils/Constants')
const ErrorHandler = require('../../helpers/ErrorHandler')

const signupValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.signupSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (isValid.errors) {
            if (
                isValid.path === "phone_number" &&
                (isValid.type === "max" || isValid.type === "min")
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.PHONE_NUMBER_LENGTH, HTTP_CODES.BAD_REQUEST)
            } else if (
                isValid.path === "password" &&
                (isValid.type === "max" || isValid.type === "min")
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.PASSWORD_LENGTH, HTTP_CODES.BAD_REQUEST)
            }
            else {
                throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
            }
        }
        else
            next();
    }
    catch (err) {
        next(err);
    }
}

const sendOtpValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.sendOtpSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (isValid.errors) {
            if (
                isValid.path === "phone_number" &&
                (isValid.type === "max" || isValid.type === "min")
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.PHONE_NUMBER_LENGTH, HTTP_CODES.BAD_REQUEST)
            }
            else if (
                isValid.path === "country_code") {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_COUNTRY_CODE, HTTP_CODES.BAD_REQUEST)
            }
            else {
                throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
            }
        }
        else
            next();
    }
    catch (err) {
        next(err);
    }
}

const verifyOtpValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.verifyOtpSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (isValid.errors) {
            if (
                isValid.path === "otp" &&
                (isValid.type === "max" || isValid.type === "min")
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.OTP_MUST_BE_LENGTH, HTTP_CODES.BAD_REQUEST)
            }
            else {
                throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
            }
        }
        else
            next();
    }
    catch (err) {
        next(err);
    }
}

const profileUpdateOnSignupValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.profileUpdateOnSignupSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error
            });
        if (!isValid.errors)
            next();
        else if (isValid.errors) {
            if (
                isValid.path === "county"
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_COUNTY_FIELD, HTTP_CODES.BAD_REQUEST)
            }
            else if (
                isValid.path === "state"
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_STATE_FIELD, HTTP_CODES.BAD_REQUEST)
            }
            else if (isValid.path === "date_of_birth") {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_DATE_OF_BIRTH, HTTP_CODES.BAD_REQUEST)
            }
            else if (
                isValid.path === "first_name" &&
                (isValid.type === "max" || isValid.type === "min")
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_FIRST_NAME_LENGTH, HTTP_CODES.BAD_REQUEST)
            }
            else if (
                isValid.path === "last_name" &&
                (isValid.type === "max" || isValid.type === "min")
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_FIRST_NAME_LENGTH, HTTP_CODES.BAD_REQUEST)
            }
            else {
                throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
            }
        }
    }
    catch (err) {
        next(err)
    }
}

const loginValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.loginSchema
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

const saveContactsValidators = (req, res, next) => {
    try {
        if (!req.body.contacts || !req.body.contacts.length)
            throw new ErrorHandler().customError(ERROR_MESSSAGES.PLEASE_PROVIDE_CONTACTS_DATA, HTTP_CODES.BAD_REQUEST)
        for (let x of (req.body.contacts)) {
            if (!x.contact_name) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_CONTACT_NAME, HTTP_CODES.BAD_REQUEST)
            }
            if (!x.contact_numbers) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.MISSING_CONTACT_NUMBER, HTTP_CODES.BAD_REQUEST)
            }
        }
        next()
    }
    catch (err) {
        next(err)
    }
}

const getContactsValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.getContactsSchema
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

const getVerificationFormListValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.getVerificationFormListSchema
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

const addQuestionsValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.addQuestionSchema
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

const profileActionsValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.profileActionSchema
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

const deleteSuspendValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.deleteSuspendSchema
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

const forgotPasswordValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.forgotPasswordSchema
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

const resetPasswordValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.resetPasswordSchema
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
            if (req.body.password !== req.body.confirm_password) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.PASSWORD_MISMATCH, HTTP_CODES.BAD_REQUEST)
            }
            else
                throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const deleteQuestionValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.deleteQuestionSchema
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

const getProfileDetailsValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.getProfileDataSchema
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

const getVerificationFormDetailsValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.getVerificationFormDataSchema
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

module.exports = {
    signupValidators,
    sendOtpValidators,
    verifyOtpValidators,
    profileUpdateOnSignupValidators,
    loginValidators,
    saveContactsValidators,
    getContactsValidators,
    addQuestionsValidators,
    forgotPasswordValidators,
    resetPasswordValidators,
    deleteQuestionValidators,
    getProfileDetailsValidators,
    profileActionsValidators,
    getVerificationFormDetailsValidators,
    getVerificationFormListValidators,
    deleteSuspendValidators,
}