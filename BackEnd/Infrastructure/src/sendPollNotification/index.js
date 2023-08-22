const { Pool } = require("pg");
const FCM_SEND_PUSH_URL = "https://fcm.googleapis.com/fcm/send";
const Client = require("node-rest-client").Client;
const { v4: uuidv4 } = require('uuid');


// check if user has added multiple accounts or business accounts..
const checkForMultipleAccounts = async (userId, pool) => {
    try {
        let userData;
        const query = `select parent_id,user_name ,(select count(user_id) from users 
        where parent_id = $1) as counter
        from users
        where user_id = $1;`
        const data = await pool.query(query, [userId]);
        if (data && data.rows && data.rows.length) {
            if (data.rows[0].counter > 0 || data.rows[0].parent_id) {
                userData = {
                    user_name: data.rows[0].user_name,
                    multiple_accounts: true
                }
            } else {
                userData = {
                    user_name: data.rows[0].user_name,
                    multiple_accounts: false
                }
            }
            return userData;
        }
        else
            return 0;
    }
    catch (err) {
        console.error(err);
    }
}

const getNotificationMessage = async (notificationObj, userId, pool) => {
    try {
        const multiAccountUserData = await checkForMultipleAccounts(userId, pool);
        if (multiAccountUserData.multiple_accounts) {
            return `(${multiAccountUserData.user_name}):${notificationObj.message.replace('{user_name}', multiAccountUserData.user_name)}`
        } else {
            return `${notificationObj.message.replace('{user_name}', multiAccountUserData.user_name)}`
        }
    }
    catch (err) {
        console.error(err);
    }
}



const getBadgeCountOfUsers = async (userId, pool) => {
    try {
        const query = `SELECT  COALESCE(COUNT(notification_id),0) AS count FROM "notifications" WHERE "is_read"=false AND "receiver_id"=$1`
        const data = await pool.query(query, [userId]);
        if (data && data.rows && data.rows.length)
            return data.rows[0].count;
        else
            return 0;
    }
    catch (err) {
        console.error(new Error(err))
    }
}


const getUserIds = (data) => {
    try {
        const userIds = [];
        for (const x of data.rows) {
            if (x.userIds && x.userIds.length) {
                for (const y of x.userIds) {
                    userIds.push(y);
                }
            }
        };
        return userIds;
    }
    catch (err) {
        console.error(new Error(err))

    }
}



exports.handler = async (event, context, callback) => {
    //connect to database ..
    const credentials = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };
    const pool = new Pool(credentials);
    try {
        const questionId = event.question_id;
        const data = await getAnsweredUserIds(questionId, pool);
        if (data && data.rows.length) {
            if (data.rows && data.rows.length) {
                const filteredUserIds = getUserIds(data);
                console.log(`Userids are`,filteredUserIds);
                for (const y of filteredUserIds) {
                    const notificationObj = {};
                    notificationObj.question_id = questionId
                    notificationObj.type = 22; //for sending poll notification ..
                    notificationObj.sender_id = y;
                    notificationObj.receiver_id = y;
                    notificationObj.created_at = Date.now();
                    notificationObj.message = `Hello {user_name} answered poll has been ended!`
                    notificationObj.message = await getNotificationMessage(notificationObj, y, pool);
                    notificationObj.badgeCount = await getBadgeCountOfUsers(y, pool);
                    notificationObj.notification_id = uuidv4();
                    await pool.query(`INSERT INTO notifications (notification_id,sender_id,receiver_id,type,message,question_id,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [notificationObj.notification_id, notificationObj.sender_id, notificationObj.receiver_id, notificationObj.type, notificationObj.message, notificationObj.question_id, notificationObj.created_at]).catch(err => console.error(err));
                    const deviceTokens = await getDeviceTokens(y, pool);
                    console.log(`Device tokens are`,deviceTokens.rows);
                    if (deviceTokens && deviceTokens.rows && deviceTokens.rows.length) {
                       
                        for (let x of deviceTokens.rows) {

                            await sendPushNotifications(notificationObj, x.device_token, x.device_type).catch(err => console.error(err));
                        }
                    }

                }
            }
        } else {
            console.error(`Invalid Question Id`);
        }
    } catch (error) {
        console.error(error);
        //send failure notification .
    }
};





// This function gets question media data ...
async function getAnsweredUserIds(questionId, pool) {
    try {
        const query = `
      SELECT array_agg(user_id) AS "userIds" FROM user_answers  WHERE question_id =$1 GROUP BY user_id;
    `;
        const values = [questionId];
        console.log("Query is --", query);
        return await pool.query(query, values);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// This function gets question media data ...
async function getDeviceTokens(userId, pool) {
    try {
        const query = `SELECT device_token,device_type FROM user_devices WHERE "user_id"=$1 and notification_enabled=true`;
        console.log("Query is --", query);
        const values = [userId];
        return await pool.query(query, values);
    } catch (error) {
        console.error(error);
    }
}



//send push notification..
const sendPushNotifications = async (data, deviceTokens, deviceType) => {
    try {
        const DEVICE_TYPE = {
            ANDROID: 1,
            IOS: 2,
            WEB: 3,
        };
        let nodeClient = new Client();
        let args = {
            data: {
                notification: {
                    title: `WeThink Notification`,
                    body: data.message || `Silent Push`,
                    sound: "default",
                    channelId: "default",
                    badge: data.badgeCount ? parseInt(data.badgeCount) : 1,
                    icon: ``,
                    content_available: true,
                },
                data: { push_data: JSON.stringify(data) },
                registration_ids: [deviceTokens],
                priority: "high",
                restricted_package_name: "",
                title: `WeThink Notification`,
                body: data.message || `Silent Push`,
                sound: "default",
            },
            headers: {
                "Content-Type": "application/json",
                Authorization: `key=${process.env.FIREBASE_KEY}`,
            },
        };
        if (data.type === 1 && +deviceType === +DEVICE_TYPE.IOS) {
            //for silent push
            args.data.content_available = true;
            delete args.data.notification;
        }
        if (+deviceType === +DEVICE_TYPE.ANDROID) {
            delete args.data.notification;
        }
        console.log(`Arguments is`, args);
        let response = await clientRest(nodeClient, args);
        console.log("Data =====>", response);

    } catch (e) {
        console.error(e);
    }
};

function clientRest(nodeClient, args) {
    return new Promise((resolve) => {
        nodeClient.post(FCM_SEND_PUSH_URL, args, (data, response) => {
            resolve(data);
        });
    });
}

