const multer = require('multer');
const multerPath = `temp/`;

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, multerPath);
    },
    filename(req, file, callback) {
        const newOrigionalName = file.originalname.replace(/[^A-Z0-9.]/gi, '');
        callback(null, `${newOrigionalName}`);
    },
});

const upload = multer({ storage });

const singleFile = function (key) {
    if (key) {
        return upload.single(key);
    }
};

const multiFile = function (key) {
    return upload.array(key);
};

const multiFields = function (fieldsArray) {
    return upload.fields(fieldsArray);
};

module.exports = {
    singleFile,
    multiFile,
    multiFields
}