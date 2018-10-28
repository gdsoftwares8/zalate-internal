var guid = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

/**
 * generate new 6 digit random number
 * @returns {number}
 */
var generateNewOtp = function () {
    return Math.floor(100000 + Math.random() * 900000);
};

var isStringEmpty = function (str) {
    if (str === null || str === undefined)return true;
    if (str.length > 0)    return false;
    if (str.length === 0)  return true;
    return true;
};

var isNumber = function (o) {
    if (typeof o === 'number')
        return true;
    return !isNaN(o - 0) && o !== null && o.replace(/^\s\s*/, '') !== "" && o !== false;
};

exports.guid = guid;
exports.generateNewOtp = generateNewOtp;
exports.isStringEmpty = isStringEmpty;
exports.isNumber = isNumber;