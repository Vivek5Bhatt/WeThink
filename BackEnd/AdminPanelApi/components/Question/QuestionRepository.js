const { UserModel, UserDevicesModel, UserContactsModel, QuestionCategoryModel, QuestionModel, QuestionImagesModel, QuestionOptionsModels, CategoryMasterModel, ExpiredJwtModel } = require('../../models')
const Logger = require('../../helpers/Logger')
const Sequelize = require('../../config/connection')
const { QueryTypes } = require('../../config/connection')
const { v4: uuidv4 } = require("uuid");
const { getStartOfDay } = require('../../helpers/Moment');
const { ROLE_IDS } = require('../../utils/Constants');

class QuestionRepository {
    constructor() { }
    async getCountyStateCount() {
        try {
            const query = `SELECT COUNT(1) FILTER (WHERE county is not null) as county_count, COUNT(1) FILTER (where state is not null) AS state_count FROM users WHERE role=:roleId`;
            return await this.executeSelectRawQuery(query, {roleId:String(ROLE_IDS.USER)});
        }
        catch (err) {

        }
    }

    async executeSelectRawQuery(query, replacements) {
        try {
            return await Sequelize.query(query, { replacements: replacements, type: QueryTypes.SELECT })
        }
        catch (err) {
            Logger.error(new Error(err))
            throw err;
        }
    }
}


module.exports = QuestionRepository

