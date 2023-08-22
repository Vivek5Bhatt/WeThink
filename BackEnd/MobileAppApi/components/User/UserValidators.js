const UserSchemaValidators = require('./UserSchemaValidators')
const { HTTP_CODES, ERROR_MESSSAGES } = require('../../utils/Constants')
const ErrorHandler = require('../../helpers/ErrorHandler');
const { validatePhoneNumber } = require('../../utils/CommonFunctions');

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
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        } else
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
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        } else
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
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
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
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const completeBusinessProfileValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.completeBusinessProfileSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (!isValid.errors) next();
        else if (isValid.errors) {
            throw new ErrorHandler().customError(
                isValid.errors[0],
                HTTP_CODES.BAD_REQUEST
            );
        }
    } catch (err) {
        next(err);
    }
};

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
            } if (!validatePhoneNumber(x.contact_numbers)) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_CONTACT_NUMBERS, HTTP_CODES.BAD_REQUEST)
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

const getFollowingValidators = async(req, res, next)=>{
    try{
        const isValid = await UserSchemaValidators.getFollowingSchema
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
    }catch(err){
        next(err)   
    }
}

const addCategoryValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.addCategorySchema
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

const updateCategoryValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.updateCategorySchema
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

const deleteCategoryValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.deleteCategorySchema
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
        else if (isValid.errors) {
            if (
                isValid.path === "question_title" &&
                (isValid.type === "max" || isValid.type === "min")
            ) {
                throw new ErrorHandler().customError(ERROR_MESSSAGES.INVALID_QUESTION_LENGTH, HTTP_CODES.BAD_REQUEST)
            }
            else
                throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
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
            throw new ErrorHandler().customError(isValid.errors[0], HTTP_CODES.BAD_REQUEST)
        }
    }
    catch (err) {
        next(err)
    }
}

const getQuestionDetailValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.validateQuestionIdSchema.validate(req.query)
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


const saveAnswerQuestionValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.saveAnswerSchema.validate(req.body)
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


const updateProfileValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.updateProfileSchema.validate(req.body)
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

const updateBusinessProfileValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.updateBusinessProfileSchema.validate(req.body)
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

const changeAccountPrivacySchema = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.accountSchema.validate(req.body)
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

const viewOtherProfileSchema = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.viewOtherProfileSchema.validate(req.query)
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

const viewOtherNewProfileSchema = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.viewOtherNewProfileSchema.validate(req.query)
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

const followUnfollowValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.followUnfollowSchema.validate(req.body)
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

const userShareValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.validateQuestionIdSchema.validate(req.body)
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


const followActionValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.followActionSchema.validate(req.body)
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



const changePasswordValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.changePasswordSchema.validate(req.body)
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


const enableDisableNotificationSettingsValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.enableDisableNotificationSchema.validate(req.body)
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


const updateNotificationSeenValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.updateSeenNotificationSchema.validate(req.body)
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

const switchProfileSchema = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.switchProfileSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (!isValid.errors) next();
        else {
            throw new ErrorHandler().customError(
                isValid.errors[0],
                HTTP_CODES.BAD_REQUEST
            );
        }
    } catch (err) {
        next(err);
    }
};

const getSuggestedFriendValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.getSuggestedFriendSchema
            .validate(req.query)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (!isValid.errors) next();
        else {
            throw new ErrorHandler().customError(
                isValid.errors[0],
                HTTP_CODES.BAD_REQUEST
            );
        }
    } catch (err) {
        next(err);
    }
};

const enableDisableContactsSyncingValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.updateContactSyncingSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (!isValid.errors) next();
        else {
            throw new ErrorHandler().customError(
                isValid.errors[0],
                HTTP_CODES.BAD_REQUEST
            );
        }
    } catch (err) {
        next(err);
    }
};

const genderShowValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.genderShowSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (!isValid.errors) next();
        else {
            throw new ErrorHandler().customError(
                isValid.errors[0],
                HTTP_CODES.BAD_REQUEST
            );
        }
    } catch (err) {
        next(err);
    }
};

const searchUserValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.searchUserSchema
            .validate(req.query)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (!isValid.errors) next();
        else {
            throw new ErrorHandler().customError(
                isValid.errors[0],
                HTTP_CODES.BAD_REQUEST
            );
        }
    } catch (err) {
        next(err);
    }
};

const subscribeSchemaValidator = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.subscribeSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (!isValid.errors) next();
        else {
            throw new ErrorHandler().customError(
                isValid.errors[0],
                HTTP_CODES.BAD_REQUEST
            );
        }
    } catch (err) {
        next(err);
    }
};

const reportUserValidators = async (req, res, next) => {
    try {
        const isValid = await UserSchemaValidators.reportUserSchema
            .validate(req.body)
            .then((valid) => {
                return valid;
            })
            .catch((error) => {
                return error;
            });
        if (!isValid.errors) next();
        else {
            throw new ErrorHandler().customError(
                isValid.errors[0],
                HTTP_CODES.BAD_REQUEST
            );
        }
    } catch (err) {
        next(err);
    }
};

module.exports = {
    signupValidators,
    sendOtpValidators,
    verifyOtpValidators,
    profileUpdateOnSignupValidators,
    completeBusinessProfileValidators,
    loginValidators,
    saveContactsValidators,
    getContactsValidators,
    addQuestionsValidators,
    resetPasswordValidators,
    getQuestionDetailValidators,
    saveAnswerQuestionValidators,
    updateProfileValidators,
    changeAccountPrivacySchema,
    viewOtherProfileSchema,
    followUnfollowValidators,
    userShareValidators,
    followActionValidators,
    changePasswordValidators,
    enableDisableNotificationSettingsValidators,
    updateNotificationSeenValidators,
    switchProfileSchema,
    getSuggestedFriendValidators,
    updateBusinessProfileValidators,
    enableDisableContactsSyncingValidators,
    searchUserValidators,
    subscribeSchemaValidator,
    reportUserValidators,
    genderShowValidators,
    addCategoryValidators,
    updateCategoryValidators,
    deleteCategoryValidators,
    getFollowingValidators,
    viewOtherNewProfileSchema
};
