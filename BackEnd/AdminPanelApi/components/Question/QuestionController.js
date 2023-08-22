const QuestionService = require('./QuestionServices')
const { ORM_ERRORS, HTTP_CODES, ERROR_MESSSAGES, SIGNUP_TYPE, LOGIN_TYPE } = require('../../utils/Constants')
const ErrorHandler = require('../../helpers/ErrorHandler')
const Logger = require('../../helpers/Logger')
const { checkImageSize } = require('../../utils/CommonFunctions')
class QuestionContoller {
    constructor() {
        this.QuestionServicesObj = new QuestionService()
    }

    async getCountyStateCountController() {
        try {
            return await this.QuestionServicesObj.getStateCountyService()
        }
        catch (err) {
            Logger.error(new Error(er))
            throw err
        }
    }


}


module.exports = QuestionContoller