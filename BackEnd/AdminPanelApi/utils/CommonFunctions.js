const fs = require('fs')

const generateOtp = () => {
    const digits = '0123456789';
    const otpLength = 6;
    let otp = '';
    for (let i = 1; i <= otpLength; i++) {
        const index = Math.floor(Math.random() * (digits.length));
        otp = otp + digits[index];
    }
    return otp;
}

const checkValidDateFormat = (requestDate) => Date.parse(requestDate) ? true : false

const checkImageSize = (file, size) => {
    try {
        const stats = fs.statSync(file.path);
        const fileSizeInBytes = stats.size;
        return (fileSizeInBytes / 1000000.0) > size ? false : true;
    }
    catch (e) {
        throw e;
    }
}

const pagination = (page, page_size) => {
    if (page_size) {
        page_size = Number(page_size)
    } else {
        page_size = constants.OFFSET_LIMIT
    }
    if (page) {
        page = ((Number(page) - 1) * Number(page_size))
    } else {
        page = 0
    }
    return [page, page_size];
}

// generate options for star rating ..
const generateOptions = () => {
    return [1, 2, 3, 4, 5].map(item => {
        return {
            name: `${item}-STAR`,
            option: item
        }
    })
}

const convertDayIntoMilliSeconds = (day) => {
    return day * 24 * 60 * 60 * 1000;
}
/* Check if string is valid UUID */
function checkValidUUID(str) {
    // Regular expression to check if string is a valid UUID
    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    return regexExp.test(str);
}

module.exports = {
    generateOtp,
    checkValidDateFormat,
    checkImageSize,
    pagination,
    generateOptions,
    convertDayIntoMilliSeconds,
    checkValidUUID
}