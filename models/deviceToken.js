/**
 * Created by Vishwas on 17-09-2018.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var deviceTypeId = {
    ANDROID: 0,
    IOS: 1,
    CHROME: 2,
    BROWSER: 3
};
var deviceShortName = {
    ANDROID: 'a',
    IOS: 'i',
    CHROME: 'c',
    BROWSER: 'b'
};
var DeviceToken = new Schema({
    userID: {type: String, required: true, ref: 'User', index: true},
    deviceType: {type: Number, "default": 0, required: true},
    deviceTokenID: {type: String, required: false},
    deviceName: {type: String, "default": "", required: false},
    osVersion: {type: String, "default": "", required: false},
    appVersion: {type: String, "default": "", required: false},
    uid: {type: String, "default": "", required: false, index: true}
});

var getTypeIdBySortName = function (sortName) {
    for (var attr in deviceShortName) {
        if (deviceShortName.hasOwnProperty(attr) && deviceShortName[attr] == sortName) {
            return deviceTypeId[attr] != undefined ? deviceTypeId[attr] : deviceTypeId.BROWSER;
        }
    }
    return deviceTypeId.BROWSER;
};

/**
 * get the device type name
 * @param deviceType {Number}
 * @returns {string}
 */
var getTypeName = function (deviceType) {
    switch (deviceType) {
        case deviceTypeId.ANDROID:
            return 'Android';
        case deviceTypeId.IOS:
            return 'iOS';
        case deviceTypeId.BROWSER:
            return 'Browser';
        case deviceTypeId.CHROME:
            return 'Chrome';
        default :
            return 'Android';
    }
};
/**
 * return device type ie. 'Android' | 'Ios', 'Chrome app'
 */
DeviceToken.method('getTypeName', function () {
    return getTypeName(this.deviceType);
});

exports.DeviceToken = mongoose.model('DeviceToken', DeviceToken);
exports.DEVICE_TYPE_IDS = deviceTypeId;
exports.getDeviceTypeName = getTypeName;
exports.getDeviceTypeIdBySortName = getTypeIdBySortName;