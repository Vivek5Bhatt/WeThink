const QuestionRepository = require('./QuestionRepository')
const Logger = require('../../helpers/Logger');
require('dotenv-safe').config()
class QuestionServices {
    constructor() {
        this.QuestionRepositoryObj = new QuestionRepository()
    }
    async getStateCountyService() {
        try {
            return await this.QuestionRepositoryObj.getCountyStateCount();

        }
        catch (err) {
            Logger.error(new Error(err))

            throw err;
        }
    }

}


module.exports = QuestionServices