const {
  VerificationRequestModel,
  VerificationCategoriesModel,
  IdentityTypesModel,
} = require("../../models");
const Logger = require("../../helpers/Logger");
const { getSignedUrl } = require("../../awsfunctions/AwsS3");
require("dotenv-safe").config({});

class VerificationRepository {
  constructor() { }

  async getVerificationCategories() {
    try {
      return await VerificationCategoriesModel.findAll({
        where: { is_deleted: false },
        order: [["preference_order", "ASC"]],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getIdentityTypes() {
    try {
      return await IdentityTypesModel.findAll({
        where: { is_deleted: false },
        order: [["preference_order", "ASC"]],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getVerificationData(userId) {
    try {
      return await VerificationRequestModel.findOne({
        where: { user_id: userId },
        attributes: ["id", "created_at", "updated_at"],
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async createVerificationRequest(requestData) {
    try {
      return await VerificationRequestModel.create(requestData);
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async resubmitVerificationRequest(requestData, id) {
    try {
      return await VerificationRequestModel.update(requestData, {
        where: { id: id },
      });
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getVerificationRequestDetails(userId) {
    try {
      const data = await VerificationRequestModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: IdentityTypesModel, attributes: ["identity_type"]
          },
          {
            model: VerificationCategoriesModel, attributes: ['name']
          }
        ],
        attributes: [
          "id",
          "user_name",
          "full_name",
          "email",
          "phone_number",
          "selfie_url",
          "id_type",
          "user_comment",
          "updated_at",
          "status",
          "working_name",
          "category_id"
        ],
      });

      if (data && data.dataValues) {
        const url = await getSignedUrl(data.dataValues.selfie_url);
        data.dataValues.selfie_url = url;
      }
      return data;
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }
}

module.exports = VerificationRepository;
