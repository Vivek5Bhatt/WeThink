require("dotenv-safe").config();
const https = require("https");
const emojiStrip = require('emoji-strip');

const createLink = (requestData) => {
  let responseData = ``;
  const removeEmojiInString = emojiStrip(requestData.question_title).replace(/[^0-9-,'":()&<>$~%.?a-z-,'":()&<>$~%.?A-Z. ]/g, '')
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      dynamicLinkInfo: {
        domainUriPrefix: `https://wethink.page.link`,
        link: `https://wethink.page.link/${requestData.question_id}`,
        // androidInfo: {
        //   androidPackageName: "com.wethink",
        // },
        iosInfo: {
          iosBundleId: "dev.wethink",
        },
        socialMetaTagInfo: {
          socialTitle: removeEmojiInString,
          socialDescription: "",
          socialImageLink: requestData.questions_image.dataValues.image_url ? requestData.questions_image.dataValues.image_url : requestData.questions_image.dataValues.video_thumbnail,
        }
      }
    });
    const options = {
      hostname: "firebasedynamiclinks.googleapis.com",
      path: `/v1/shortLinks?key=${process.env.WEB_API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": postData.length,
      },
    };
    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      if (res.statusCode === 200) {
        res.on("data", (d) => {
          responseData += d;
        });
      } else resolve(null);
      res.on("end", function () {
        resolve(responseData);
      });
    });
    req.on("error", (e) => {
      resolve(null);
    });
    req.on("end", () => {
      `Create link end`;
    });
    req.write(postData);
    req.end();
  });
};

module.exports = {
  createLink,
};
