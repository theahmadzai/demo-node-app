const crypto = require('crypto');
const config = require('./config');

const helpers = {};

helpers.hash = (str) => {
    if (typeof (str) != 'string' || str.length <= 0) {
        return false;
    }

    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');

    return hash;
};

helpers.parseJsonToObject = (str) => {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (err) {
        return {};
    }
};

helpers.createRandomString = (strLen) => {
    strLen = typeof (strLen) == 'number' && strLen > 0 ? strLen : false;

    if (!strLen) {
        return false;
    }

    return crypto.randomBytes(strLen).toString('hex');
};

module.exports = helpers;
