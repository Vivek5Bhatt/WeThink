const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const FCM_SEND_PUSH_URL = "https://fcm.googleapis.com/fcm/send";
const Client = require("node-rest-client").Client;

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
    let question_id;
  try {
    let pushData ={};
    const transcodedVideoUrl = event.transcodedVideoUrl;
    const videoUrl = event.videoUrl;
    const userId = event.userId;
    const deviceTokensData = await getDeviceTokens(userId, pool);
    const deviceTokens = deviceTokensData.rows;
    const data = await getQuestionData(videoUrl, pool);
    pushData.question_id = null;
    if (data && data.rows.length) {
      if (!data.rows[0].transcoded_video_url) {
        question_id = data.rows[0].question_id;
        await updateQuestionImagesTable(
          transcodedVideoUrl,
          data.rows[0].question_id,
          pool
        );
        await updateQuestionsTable(question_id, pool);
        // send push for success...
        pushData.question_id = data.rows[0].question_id;
        pushData.type = 12; //for success ..
        pushData.video_url = videoUrl;
        for(let x of deviceTokens){
          await sendPushNotifications(pushData,x.device_token,x.device_type);
         }
        }
    } else {
      await addVideoToTranscoderAudit(transcodedVideoUrl, videoUrl, pool);
    }
  } catch (error) {
    console.error(error);
    //send failure notification .
     await sendErrorNotification(event.videoUrl,event.userId,question_id,pool);
  }
};

// This function gets question media data ...
async function getQuestionData(videoUrl, pool) {
  try {
    const query = `
      SELECT question_id,transcoded_video_url from questions_images  where video_url = '${videoUrl}';
    `;
    console.log("Query is --", query);
    return pool.query(query);
  } catch (error) {
    throw error;
  }
}

// This function gets question media data ...
async function getDeviceTokens(userId, pool) {
  try {
    const query = `SELECT device_token,device_type FROM user_devices WHERE "user_id"= $1 and notification_enabled=true`;
    console.log("Query is --", query);
    const values = [userId];
    return pool.query(query, values);
  } catch (error) {
    throw error;
  }
}

// this question updates the question images table with transcoded url ..
async function updateQuestionImagesTable(transcodedVideoUrl, questionId, pool) {
  try {
    const query = `
    UPDATE questions_images set transcoded_video_url = $1 where question_id = $2; 
   `;
    console.log("Query is --", query);
    const values = [transcodedVideoUrl, questionId];
    return pool.query(query, values);
  } catch (error) {
    throw error;
  }
}

async function updateQuestionsTable(questionId, pool) {
  try {
    const query = `
    UPDATE questions set video_status = 2 where question_id = $1;
   `;
    console.log("Query is --", query);
    const values = [questionId];
    return pool.query(query, values);
  } catch (error) {
    throw error;
  }
}

// add in video transcoder audit ..
async function addVideoToTranscoderAudit(transcodedVideoUrl, videoUrl, pool) {
  try {
    const uuid = uuidv4();
    const query = `
    INSERT into transcoded_videos_audit (id,video_url,transcoded_video_url)
    values($1,$2,$3); 
   `;
   console.log("UUID",uuid);
   console.log("Query",query);
    const values = [uuid, videoUrl, transcodedVideoUrl];
    return pool.query(query, values);
  } catch (error) {
    throw error;
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
    console.log(`Data is`, data);
    let nodeClient = new Client();
    let args = {
      data: {
        notification: {
          title: `WeThink Notification`,
          body: `${data.message || `Silent Push`}`,
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
        body: `${data.message || `Silent Push`}`,
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
    let response = await clientRest(nodeClient,args);
    console.log("Data =====>",response);
  
  } catch (e) {
    console.error(e);
  }
};

function clientRest(nodeClient,args) {
   return new Promise((resolve) =>{
        nodeClient.post(FCM_SEND_PUSH_URL, args, (data,response) => {
        resolve(data);
      });
     });
}
async function sendErrorNotification(videoUrl,userId,question_id,pool){
  let pushData = {};
  pushData.type = 13;
  pushData.question_id= question_id;
  pushData.video_url = videoUrl;
  const deviceTokensData = await getDeviceTokens(userId, pool);
  const deviceTokens = deviceTokensData.rows;
  for(let x of deviceTokens){
          await sendPushNotifications(pushData,x.device_token,x.device_type);
  }
  
}