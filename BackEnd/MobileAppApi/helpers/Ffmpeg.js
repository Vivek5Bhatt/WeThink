const Ffmpeg = require('fluent-ffmpeg');
const Logger = require('../helpers/Logger');

const createThumbNailImage = async (videoUrl, requestData) => {
    return new Promise((resolve, reject) => {
        let filePath;
        let fileData;
        Ffmpeg.ffprobe(videoUrl, function (err, metadata) {
            if (err)
                reject(err);
            fileData = metadata.streams
        });
        Ffmpeg(videoUrl)
            .on('filenames', function (filenames) {
                filePath = "temp/" + filenames[0]
            })
            .on('end', function (filenames) {
                resolve(filePath);
            })
            .on('error', function (err) {
                reject(err);
            })
            .screenshots({
                count: 1,
                folder: 'temp',
                size: requestData && requestData.width && requestData.height ? `${parseInt(requestData.width)}x${parseInt(requestData.height)}` : '383x224',
                filename: 'thumbnail-%b.png'
            })
    })
}

module.exports = {
    createThumbNailImage,
};
