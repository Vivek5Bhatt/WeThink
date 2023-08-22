const Logger = require("./Logger");
require("dotenv-safe").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const Client = require("twilio")(accountSid, authToken);

class Twilio {
    constructor() { }
    sendMessage(message, mobileNumber) {
        Client.messages
            .create({
                body: `${message}`,
                from: `${process.env.TWILIO_FROM_NUMBER}`,
                to: `${mobileNumber}`,
            })
            .then(response => console.log("Twilio sid: ", response.sid)).catch(err => console.error("Twilio error: ", err))
    }
}

module.exports = Twilio;
