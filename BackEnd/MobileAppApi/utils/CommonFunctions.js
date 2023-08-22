const fs = require("fs");
// const otpGenerator = require("otp-generator");
// const urlExist = require("url-exist");
const Domains = require("disposable-email-domains");
const WildCards = require("disposable-email-domains/wildcard.json");
require("dotenv-safe").config();
const ErrorHandler = require("../helpers/ErrorHandler");
const { ERROR_MESSSAGES, HTTP_CODES } = require("./Constants");
const Dns = require("dns");

// Otp generate
const generateOtp = (size = 6) => {
  return Math.floor(100000 + Math.random() * 900000);
  // return Number(otpGenerator.generate(size, { upperCase: false, specialChars: false, alphabets: false, digits: true }));
  // return 224455;
};

const checkValidDateFormat = (requestDate) => {
  const _regExp = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])?$');
  return _regExp.test(requestDate);
}

const checkImageSize = (file, size) => {
  try {
    const stats = fs.statSync(file.path);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes / 1000000.0 > size ? false : true;
  } catch (e) {
    Logger.error(new Error(e));
    throw e;
  }
};

// const checkIfValidUrl = async (website) => {
//   try {
//     return await urlExist(website);
//   } catch (err) {
//     Logger.error(err);
//     throw err;
//   }
// };

const checkPassword = (password) => {
  // const regex = `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}`
  // return regex.test(password)
  return true;
};

// generate options for star rating ..
const generateOptions = () => {
  return [1, 2, 3, 4, 5].map((item) => {
    return {
      name: `${item}-STAR`,
      option: item,
    };
  });
};

const checkDns = async (domainName) => {
  try {
    return new Promise((resolve, reject) => {
      Dns.resolveMx(domainName, function (err, addresses) {
        if (err) {
          reject(
            new ErrorHandler().customError(
              ERROR_MESSSAGES.PLEASE_ENTER_VALID_EMAIL,
              HTTP_CODES.BAD_REQUEST
            )
          );
        } else if (addresses && addresses.length) {
          resolve(true);
        } else
          reject(
            new ErrorHandler().customError(
              ERROR_MESSSAGES.PLEASE_ENTER_VALID_EMAIL,
              HTTP_CODES.BAD_REQUEST
            )
          );
      });
    });
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const validateEmail = async (requestData) => {
  try {
    if (process.env.ENV && process.env.ENV === "production") {
      requestData.email = requestData.email.toLowerCase();
      if (requestData.email && requestData.email.includes("@")) {
        let splitEmail = requestData.email.split("@");
        if (splitEmail.length && splitEmail.length > 1) {
          if (await checkDns(splitEmail[1])) {
            const domainIndex = Domains.indexOf(splitEmail[1]);
            const wildCardIndex = WildCards.indexOf(splitEmail[1]);
            if (wildCardIndex !== -1 || domainIndex !== -1)
              throw new ErrorHandler().customError(
                ERROR_MESSSAGES.PLEASE_ENTER_VALID_EMAIL,
                HTTP_CODES.BAD_REQUEST
              );
            else return;
          } else
            throw new ErrorHandler().customError(
              ERROR_MESSSAGES.PLEASE_ENTER_VALID_EMAIL,
              HTTP_CODES.BAD_REQUEST
            );
        } else
          throw new ErrorHandler().customError(
            ERROR_MESSSAGES.PLEASE_ENTER_VALID_EMAIL,
            HTTP_CODES.BAD_REQUEST
          );
      } else
        throw new ErrorHandler().customError(
          ERROR_MESSSAGES.PLEASE_ENTER_VALID_EMAIL,
          HTTP_CODES.BAD_REQUEST
        );
    }
    return;
  } catch (err) {
    Logger.error(new Error(err));
    throw err;
  }
};

const parseJsonFuncton = (data) => {
  let parsedData = ``;
  try {
    parsedData = JSON.parse(data);
    return parsedData;
  } catch (err) {
    return parsedData;
  }
};

const getDifferenceInDays = (data) => {
  return data / (1000 * 3600 * 24);
};

const convertDayIntoMilliSeconds = (day) => {
  return day * 24 * 60 * 60 * 1000;
};

/* Check if string is valid UUID */
function checkValidUUID(str) {
  // Regular expression to check if string is a valid UUID
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(str);
}

// Check valid phone number
function validatePhoneNumber(input_str) {
  var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
  return re.test(input_str);
}

function checkValidUserName(username){
  if(username.length > 30) return false;
    /* 
    Usernames can only have: 
    - Lowercase Letters (a-z) 
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
    */
    const res = /^[A-Za-z0-9_\.]+$/.exec(username);
    return !!res;
}

module.exports = {
  generateOtp,
  checkValidDateFormat,
  checkImageSize,
  // checkIfValidUrl,
  checkPassword,
  validateEmail,
  parseJsonFuncton,
  getDifferenceInDays,
  generateOptions,
  convertDayIntoMilliSeconds,
  checkValidUUID,
  validatePhoneNumber,
  checkValidUserName
};
