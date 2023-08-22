const jwt = require('jsonwebtoken')
require('dotenv-safe').config()
const ErrorHandler = require('../helpers/ErrorHandler')
const { HTTP_CODES, ERROR_MESSSAGES } = require('../utils/Constants')
const { UserModel, UserDevicesModel } = require('../models')
const Logger = require('../helpers/Logger')

class JWT {
    generateToken(userId) {
        try {
            return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '10000d', algorithm: 'HS256' })
        } catch (err) {
            Logger.error(err)
            throw err;
        }
    }

    async verifyToken(req, res, next) {
        try {
            const token = req.header('Authorization');
            if (!token)
                next(new ErrorHandler().customError(ERROR_MESSSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED))
            else {
                const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
                const userData = await UserModel.findOne({ where: { user_id: verifiedToken.id } })
                if (userData && !userData.is_deleted && userData.is_active) {
                    req.user = verifiedToken
                    req._userId = verifiedToken.id
                    req._userProfile = userData
                    next()
                } else if (userData && !userData.is_active && req.route.path === '/logout') {
                    req.user = verifiedToken
                    req._userId = verifiedToken.id
                    req._userProfile = userData
                    next()
                } else if (userData && userData.is_deleted) {
                    next(new ErrorHandler().customError(ERROR_MESSSAGES.USER_ALREADY_DELETED, HTTP_CODES.BAD_REQUEST))
                } else if (userData && !userData.is_active) {
                    await UserDevicesModel.destroy({ where: { user_id: verifiedToken.id }, })
                    next(new ErrorHandler().customError(ERROR_MESSSAGES.ACCOUNT_SUSPEND, HTTP_CODES.FORBIDDEN))
                } else if (!userData)
                    next(new ErrorHandler().customError(ERROR_MESSSAGES.TOKEN_NOT_EXISTED, HTTP_CODES.BAD_REQUEST))
            }
        } catch (err) {
            Logger.error(err)
            next(new ErrorHandler().customError(ERROR_MESSSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED))
        }
    }

    async verifyBusinessProfileToken(req, res, next) {
        try {
            const token = req.header('Authorization');
            if (token) {
                const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
                const userData = await UserModel.findOne({ where: { user_id: verifiedToken.id }, attributes: ['is_deleted'] })
                if (userData && userData.dataValues) {
                    if (userData.dataValues.is_deleted)
                        next(new ErrorHandler().customError(ERROR_MESSSAGES.USER_ALREADY_DELETED, HTTP_CODES.BAD_REQUEST))
                    req.user = verifiedToken;
                    req._userId = verifiedToken.id;
                    next()
                } else if (!userData)
                    next(new ErrorHandler().customError(ERROR_MESSSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED))
            } else
                next()
        } catch (err) {
            Logger.error(err)
            next(new ErrorHandler().customError(ERROR_MESSSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED))
        }
    }
}

module.exports = JWT