const crypto = require("crypto");
require("dotenv-safe").config();
const Logger = require('../helpers/Logger');
const { ERROR_MESSSAGES } = require("../utils/Constants");

const ENCRYPTION_KEY = Buffer.from(process.env.CYPHER_KEY, "base64");

const getCypherToken = (uuid) => {
    try {
        const iv_length = 16;
        let iv = crypto.randomBytes(iv_length);
        let cipher = crypto.createCipheriv(
            "aes-256-ctr",
            Buffer.from(ENCRYPTION_KEY, "hex"),
            iv
        );
        let encrypted = cipher.update(uuid);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString("hex") + ":" + encrypted.toString("hex");
    } catch (error) {
        Logger.error("Error in createCipherIV function :-", new Error(error))
        error.statusCode = 400;
        error.errorMessage = ERROR_MESSSAGES.UNABLE_TO_VERIFY_TOKEN
        throw error;
    }
}

const getUserIdFromToken = (text, res) => {
    try {
        let textParts = text.split(":");
        let iv = Buffer.from(textParts.shift(), "hex");
        let encryptedText = Buffer.from(textParts.join(":"), "hex");
        let dicipher = crypto.createDecipheriv(
            "aes-256-ctr",
            Buffer.from(ENCRYPTION_KEY, "hex"),
            iv
        );
        let decrypted = dicipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, dicipher.final()]);
        return decrypted.toString();
    } catch (error) {
        error.statusCode = 400;
        error.errorMessage = ERROR_MESSSAGES.UNABLE_TO_VERIFY_TOKEN
        Logger.error(error)
        throw error
    }
}

module.exports = {
    getCypherToken,
    getUserIdFromToken,
};
