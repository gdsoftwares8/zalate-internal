var JsonStrategy = require('passport-json').Strategy;
var User = require('../models/user').USER;
var DeviceToken = require('../models/deviceToken').DeviceToken;
var USER_ROLE = require('../models/user').USER_ROLES;
var async = require('async');
var bCrypt = require('bcrypt-nodejs');
var request = require('request');
const logger = require('../logger');
var InviteCode = require('../models/inviteCode');
var AppUtil = require('../controllers/apputil');
var EmailService = require('../controllers/EmailService');
var Response = require('../controllers/Response');
var getDeviceTypeIdBySortName = require('../models/deviceToken').getDeviceTypeIdBySortName;
var MAX_DEVICE_LIMIT = 30;
var DEVICE_TYPE_IDS = require('../models/deviceToken').DEVICE_TYPE_IDS;

function rollback(doc, callback) {
    //check if its a doc
    if (doc && typeof doc.remove === 'function') {
        doc.remove(function (err, doc) {
            callback();
        });
    } else {
        callback();
    }
}

module.exports = function (passport) {
    passport.use('signup', new JsonStrategy({
            passReqToCallback: true // allows us to pass back the entire request to the callback
        }, (req, username, password, done) => {


            email = req.body.email.toLowerCase();
            logger.debug('Attempting to sign up email: ' + email);

            findOrCreateUser = function () {
                console.log('Find or create called');
                // find a user in Mongo with provided email
                User.findOne({'email': {$regex: new RegExp("^" + email.toLowerCase(), "i")}}).then(user => {
                    // already exists
                    console.log('Made it to user');
                    if (user) {
                        console.log('User already exists with email: ' + email);
                        return done(null, false, console.log('message', 'User Already Exists'));
                    }


                    else {


                        // Create the user
                        var newUser = new User();
                        var specialId = email.substring(1, 4) + Date.now();
                        // set the user's local credentials
                        var setPassword = createHash(password);

                        //Create new user
                        newUser.id = specialId;
                        newUser.password = setPassword;
                        newUser.role = USER_ROLE.CLIENT;
                        newUser.email = email;
                        newUser.firstName = req.body.firstName;
                        newUser.lastName = req.body.lastName;
                        newUser.location = req.body.location;
                        newUser.whatsApp = req.body.whatsApp;
                        newUser.telegram = req.body.telegram;
                        newUser.phoneNumber = req.body.phoneNumber;
                        newUser.skype = req.body.skype;

                        var guid = AppUtil.guid();
                        var otp = AppUtil.generateNewOtp();

                        newUser.pwResetToken = guid;
                        newUser.pwResetOTP = otp;
                        // newUser.otpDate = new Date().getTime();
                        // save the user
                        /* newUser.save(function (err) {
                             if (err) {
                                 logger.error('Error in Saving user: ' + err);
                                 throw err;
                             }
                             else {

                                 registerToken(req, done, newUser);
                                 /!* logger.info('User Registration succesful');
                                  console.log('New User Sccessfully Made');
                                  return done(null, newUser);*!/
                             }

                         });*/
                        async.parallelLimit([
                                function (callback) {
                                    newUser.save(callback);
                                }
                            ], 3,
                            function (err, results) {
                                if (err) {
                                    async.each(results, rollback, function () {
                                        console.log('Rollback done.');
                                    });
                                    console.log('error ', err);
                                    logger.error('Error in Saving user: ' + err);
                                    throw err;
                                } else {
                                    sendOtpToMail(newUser.firstName, newUser.pwResetOTP, newUser.email);
                                    registerToken(req, done, newUser);
                                }
                            });
                    }
                }).catch(err => {
                    logger.error('Error in Sign Up: ' + err);
                    return done(err);
                })


            };

            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);


        })
    );

    // Generates hash using bCrypt
    var createHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}


var sendOtpToMail = function (name, otp, email) {
    var message = "Hi " + name + "," + "\n\n\nWelcome to Zatale and thank you for choosing us.\n\nWe have generated a One Time Password (OTP) code for you\nto verify your email. This OTP will verify your information and\nenable you to personalize your experience."
        + "\n\n\nYour One Time Password is " + otp + "\n\n\nThis OTP is valid for a single use only. \n\n\nSincerely,\nTeam Zatale";
    var mailOptions = {
        from: "vaishnavvishwas22@gmail.com", // sender address
        to: email, // list of receivers
        subject: "The OTP for reset password on Zatale is " + otp, // Subject line
        //text:message,
        text: message // html body
    };
    EmailService.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('error in sending mail ', error, info);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};

/**
 * register device
 * @param req
 * @param done
 * @param newUser
 */
var registerToken = function (req, done, newUser) {
    var userID = newUser.id;
    var deviceTokenID = req.body.deviceTokenID || '';
    var deviceName = req.body.deviceName || "Browser";//Android || IOS || Chrome || Browser
    var deviceType = deviceName.substring(0, 1).toLowerCase();
    var deviceFullName = req.body.deviceFullName || '';
    var uid = req.body.uid || "";//unique id of device
    var osVersion = req.body.osVersion;
    var appVersion = req.body.appVersion;

    // 1. check valid device name
    if (deviceType == 'a' || deviceType == 'i' || deviceType == 'b') {
        deviceType = getDeviceTypeIdBySortName(deviceType);
        var checkAndSaveDeviceToken = function () {
            //3.get all registered devices
            DeviceToken.find({userID: userID}, function (err, regDeviceList) {
                if (err) {
                    return done(err);
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
                        errorMessage = "You have already login maximum limit of devices.";
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
                            sandbox: isSandbox,
                            socialToken: socialToken
                        });
                    }
                    newUser.loginToken = deviceToken._id;
                    //check token was empty or not
                    newUser.deviceRegistered = deviceTokenID != '';
                    // saveDevice(deviceToken);
                    deviceTokenID = deviceTokenID.replace(/ /g, ''); //remove space if there for iOS
                    deviceToken.deviceTokenID = deviceTokenID;
                    deviceToken.save(function (err) {
                        if (err) {
                            return done(err);
                        } else {
                            return done(null, newUser);
                        }
                    });
                }
            });
        };
        if (uid != '') {
            var queryRemove = {
                //userID: {$ne: userID},
                deviceType: deviceType,
                uid: uid
            };
            //2. Remove if this device was registered by other user also.
            DeviceToken.findOneAndRemove(queryRemove, function (err, oldDevice) {
                if (err) {
                    return done(err);
                } else {
                    checkAndSaveDeviceToken();
                }
            });
        } else {
            checkAndSaveDeviceToken();
        }
    } else {
        return done(err);
    }
};


// register token
exports.registerToken = registerToken;

















