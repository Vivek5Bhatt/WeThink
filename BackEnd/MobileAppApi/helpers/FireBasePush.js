
const FCM_SEND_PUSH_URL = "https://fcm.googleapis.com/fcm/send";
const Client = require('node-rest-client').Client;
require('dotenv-safe').config()
const { DEVICE_TYPE } = require('../utils/Constants')

const sendPushNotifications = async (data, deviceTokens, deviceType) => {
    try {
        let nodeClient = new Client();
        let args = {
            data: {
                "notification": {
                    "title": `WeThink Notification`,
                    "body": `${data.message || `Silent Push`}`,
                    "sound": "default",
                    "channelId": "default",
                    "badge": data.badgeCount ? parseInt(data.badgeCount) : 1,
                    "icon": ``,
                    "content_available": true
                },
                "data": { push_data: JSON.stringify(data) },
                "registration_ids": [deviceTokens],
                "priority": "high",
                "restricted_package_name": "",
                "title": `WeThink Notification`,
                "body": `${data.message || `Silent Push`}`,
                "sound": "default",
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `key=${process.env.FIREBASE_KEY}`
            }
        };
        if (data.type === 1 && +deviceType === +DEVICE_TYPE.IOS) { //for silent push
            args.data.content_available = true
            delete args.data.notification
        } else if (+deviceType === +DEVICE_TYPE.ANDROID)
            delete args.data.notification
        nodeClient.post(FCM_SEND_PUSH_URL, args, (successData) => {
            console.log("Send push notification: ", successData);
        })
    } catch (err) {
        console.error("Send push notification error: ", err);
    }
};

module.exports = sendPushNotifications
