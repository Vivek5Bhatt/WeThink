const GOOGLE_PLUS_PROFILE_FETCH_URL =
  "https://www.googleapis.com/plus/v1/people/me?access_token=";
const Logger = require("./Logger");
const https = require("https");
// const AppleSignIn = require("apple-signin-auth");
const AppleSignIn = require("apple-signin-verify-token");
const { OAuth2Client } = require("google-auth-library");
const {
  ERROR_MESSSAGES,
  DEVICE_TYPE,
  HTTP_CODES,
} = require("../utils/Constants");
require("dotenv-safe").config();
const ErrorHandler = require("../helpers/ErrorHandler");

class SociaLogin {
  constructor() {}

  getResponse(res) {
    return new Promise((resolve) => {
      let fullResp = "";
      res.setEncoding("utf8");
      res
        .on("data", (chunk) => {
          fullResp += chunk.toString();
        })
        .on("end", () => {
          resolve(fullResp);
        });
    });
  }

  getDataFromUrl(url) {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          this.getResponse(res).then((result) => {
            resolve(result);
          });
        })
        .on("error", (err) => {
          Logger.error(new Error(err));
        })
        .end();
    });
  }

  async getGooglePlusProfile(token) {
    try {
      return this.getDataFromUrl(GOOGLE_PLUS_PROFILE_FETCH_URL + token).then(
        (resp) => {
          const retVal = JSON.parse(resp);
          if (retVal.error) {
            Logger.error(new Error(retVal.error));
            retVal.error.statusCode = retVal.error.code;
            retVal.error.errorMessage = retVal.error.message;
            throw retVal.error;
          }
          const imageUrl = retVal.image.url.replace("sz=50", "sz=200");
          retVal.image.url = imageUrl;
          return retVal;
        }
      );
    } catch (err) {
      Logger.error(new Error(err));
      throw err;
    }
  }

  async getAppleProfile(token) {
    try {
      // return await AppleSignIn.verifyIdToken(token, {
      //     audience: process.env.APPLE_CLIENT_ID,
      //     ignoreExpiration: true,
      // })
      return AppleSignIn.verify(token);
    } catch (err) {
      Logger.error(new Error(err));
      throw new ErrorHandler().customError(
        ERROR_MESSSAGES.INVALID_TOKEN_SIGNATURE,
        HTTP_CODES.BAD_REQUEST
      );
    }
  }

  async getGoogleProfile(accessToken, deviceType) {
    try {
      let CLIENT_ID;
      if (parseInt(deviceType) === DEVICE_TYPE.ANDROID)
        CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      else if (parseInt(deviceType) === DEVICE_TYPE.IOS)
        CLIENT_ID = process.env.GOOGLE_CLIENT_ID_IOS;
      const client = new OAuth2Client(CLIENT_ID);
      const ticket = await client
        .verifyIdToken({
          idToken: accessToken,
          audience: CLIENT_ID,
        })
        .catch((error) => {
          error.statusCode = 400;
          error.errorMessage = ERROR_MESSSAGES.UNABLE_TO_VERIFY_TOKEN;
          throw error;
        });
      const payload = ticket.getPayload();
      return payload;
    } catch (err) {
      err.statusCode = 400;
      err.errorMessage = ERROR_MESSSAGES.UNABLE_TO_VERIFY_TOKEN;
      Logger.error(new Error(err));
    }
  }
}

module.exports = SociaLogin;
