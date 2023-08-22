const jwt = require('jsonwebtoken')
require('dotenv-safe').config()
const ErrorHandler = require('../helpers/ErrorHandler')
const { HTTP_CODES, ERROR_MESSSAGES } = require('../utils/Constants')
const { UserModel, ExpiredJwtModel } = require('../models')
const Logger = require('../helpers/Logger')
class JWT {
    constructor() { }
    generateToken(userId) {
        try {
            return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '10d', algorithm: 'HS256' })
        }
        catch (err) {
            Logger.error(err)
            throw err;
        }

    }

    async verifyToken(req, res, next) {
        try {
            const token = req.header('Authorization');
            if (!token) {
                next(new ErrorHandler().customError(ERROR_MESSSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED))
            }
            else {
                const checkInExpiredJwt = await ExpiredJwtModel.findOne({ where: { token: token } });
                if (checkInExpiredJwt && checkInExpiredJwt.dataValues) {
                    next(new ErrorHandler().customError(ERROR_MESSSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED))
                }
                const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
                const userData = await UserModel.findOne({ where: { user_id: verifiedToken.id } })
                if (userData.dataValues && userData.dataValues.is_active && userData.dataValues.role === 1) { //For Admin Role
                    req.user = verifiedToken
                    next()
                }
                else {
                    next(new ErrorHandler().customError(ERROR_MESSSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED))

                }
              
            }
        }
        catch (err) {
            Logger.error(err)

            next(new ErrorHandler().customError(ERROR_MESSSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED))
        }

    }
}

module.exports = JWT