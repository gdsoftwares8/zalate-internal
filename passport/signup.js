var JsonStrategy = require('passport-json').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');
var request = require('request');
const logger = require('../logger');
var InviteCode = require('../models/inviteCode');
var AppUtil = require('../controllers/apputil');
var EmailService = require('../controllers/EmailService');

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
                        newUser.role = 'client';
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
                        newUser.save(function (err) {
                            if (err) {
                                logger.error('Error in Saving user: ' + err);
                                throw err;
                            }
                            else {
                                sendOtpToMail(newUser.firstName, newUser.pwResetOTP, newUser.email);
                                logger.info('User Registration succesful');
                                console.log('New User Sccessfully Made');
                                return done(null, newUser);
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






















