// import the node-modules
require('dotenv-safe').config()
const sendgrid = require('@sendgrid/mail');
const Logger = require('../helpers/Logger')

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

class SendGrid {
    constructor() { }

    async sendMail(data) {
        const message = {
            to: data.toEmail,
            from: {
                email: process.env.SEND_GRID_FROM_EMAIL,
                name: process.env.SEND_GRID_FROM_NAME
            },
            template_id: data.templateId,
            dynamic_template_data: data.templateData,
        };
        //send email
        let mail = await sendgrid.send(message)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                Logger.error(error)
            });
        return mail;
    }
}

module.exports = SendGrid
