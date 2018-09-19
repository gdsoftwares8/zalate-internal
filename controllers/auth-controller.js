"use strict";

const User = require('../models/user').USER;
const logger = require('../logger');
const jwt = require('jsonwebtoken');

const path = require('path');
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, '../config', 'config.json'))[env];
var Response = require('../controllers/Response');
var getDeviceTypeIdBySortName = require('../models/deviceToken').getDeviceTypeIdBySortName;
var MAX_DEVICE_LIMIT = 30;
var DEVICE_TYPE_IDS = require('../models/deviceToken').DEVICE_TYPE_IDS;
var ADMIN_KEY = require('../models/user').ADMIN_KEY;
var DeviceToken = require('../models/deviceToken').DeviceToken;


const createUser = function (req, res, next) {

    return res.status(200).send({message: 'Successfully signed up user'});
}

const loginUser = function (req, res, next) {
    return User.findOne(
        {email: new RegExp('^' + req.body.email.toLowerCase() + '$', 'i')}
    ).then(user => {
        if (!user) {
            logger.error('NO USER FOUND');
            return res.status(404).send({message: 'No user found'})
        } else if (user.isBlocked()) {
            var errorMessage = "Your account has been block due to compliance concerns.";
            var response = Response.createResponse(Response.RequestStatus.Fail, errorMessage, []);
            return res.status(200).json(response);
        } else {
            registerToken(req, res, user);
        }
    }).catch(err => {
        // In case of any error, return using the done method
        logger.error('There is an error', err);
        return next(err);
    })
};

const verifyJwt = (req, res, next) => {
    const token = req.body.token;

    if (!token) {
        let err = new Error()
        err.status = 401;
        err.message = 'Missing token.'
        return next(err);
    }

    jwt.verify(token, config.passport.secret, (err, decoded) => {
        if (err) {
            logger.error('Token is: ' + req.body.token, err);
            return next(err);
        }

        logger.debug('Decoded successfully');


        User.findOne({'email': decoded.email}).then(user => {
            // Username does not exist, log the error and redirect back
            if (!user) {
                logger.debug('User Not Found with username ' + decoded.data);
                let err = new Error();
                err.status = 404;
                err.message = 'User not found.';
                return next(err);
            }

            logger.info('User was Found', user.email);

            req.verifiedUser = user;
            return next();
        }).catch(err => {
            logger.error('Token is: ' + req.body.token, err);
            return next(err);
        });
    });
}

var registerToken = function (req, res, user) {
    var userID = user.id;
    var deviceTokenID = req.body.deviceTokenID || '';
    var deviceName = req.body.deviceName || "Browser";//Android || IOS || Chrome || Browser
    var deviceType = deviceName.substring(0, 1).toLowerCase();
    var deviceFullName = req.body.deviceFullName || '';
    var uid = req.body.uid || "";//unique id of device
    var osVersion = req.body.osVersion;
    var appVersion = req.body.appVersion;

    deviceType = getDeviceTypeIdBySortName(deviceType);
    var checkAndSaveDeviceToken = function () {
        //3.get all registered devices
        DeviceToken.find({userID: userID}, function (err, regDeviceList) {
            if (err) {
                return res.send(500, err);
            } else {

                var deviceToken = null;
                var needToSave = true;
                var errorMessage = '';
                var mobileDevices = 0;//count the users mobile devices
                //4.Check if device already there
                for (var i = 0; i < regDeviceList.length; i++) {
                    var device = regDeviceList[i];
                    if (device.deviceType != 'b') {
                        mobileDevices++;
                    }
                    if (device.uid == uid && device.deviceType == deviceType) {
                        needToSave = false;
                        deviceToken = device;
                        break;
                    }
                }
                //5. Check if Max device limit reached.
                if (deviceType != 'b' && needToSave && mobileDevices >= MAX_DEVICE_LIMIT) {
                    needToSave = false;
                }
                if (needToSave) {
                    // console.info('saving new device token');
                    //6. Save the device token
                    deviceToken = new DeviceToken({
                        userID: userID,
                        deviceType: deviceType,
                        deviceTokenID: deviceTokenID,
                        deviceName: deviceFullName,
                        uid: uid,
                        osVersion: osVersion,
                        appVersion: appVersion
                    });
                }
                user.loginToken = deviceToken._id;
                //check token was empty or not
                user.deviceRegistered = deviceTokenID != '';
                // saveDevice(deviceToken);
                deviceTokenID = deviceTokenID.replace(/ /g, ''); //remove space if there for iOS
                deviceToken.deviceTokenID = deviceTokenID;
                deviceToken.save(function (err) {
                    if (err) {
                        return res.send(500, err);
                    } else {
                        let longSignIn = 900000;
                        if (req.body.remember) {
                            if (req.body.remember == true) {
                                longSignIn = 99999999;
                                logger.debug('New sign in is long: ', longSignIn);
                            }
                            if (req.body.remember == false) {
                                longSignIn = 900000;
                            }
                            else {
                                longSignIn = 900000;
                            }
                        }
                        return res.status(200).send({
                            success: true,
                            email: user.email,
                            pwResetToken: user.pwResetToken,
                            userType: user.userType,
                            token: jwt.sign({
                                exp: Math.floor(Date.now() / 1000) + longSignIn,
                                email: user.email,
                                role: user.role,
                                id: user.id
                            }, config.passport.secret)
                        });
                    }
                });
            }
        });
    };

    var queryRemove = {
        deviceType: deviceType,
        uid: uid
    };
    //2. Remove if this device was registered by other user also.
    DeviceToken.findOneAndRemove(queryRemove, function (err, oldDevice) {
        if (err) {
            return res.send(500, err);
        } else {
            checkAndSaveDeviceToken();
        }
    });
};

module.exports = {
    loginUser: loginUser,
    createUser: createUser,
    verifyJwt: verifyJwt,
}