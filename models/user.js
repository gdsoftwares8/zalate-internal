/**
 * Created by Vishwas on 17-09-2018.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    SALT_WORK_FACTOR = 10;

var AppUtil = require('../controllers/AppUtill');

var bcrypt = null;
try {
    bcrypt = require('bcrypt-nodejs');
} catch (err) {
    console.log(err);
}

var currentListing = new Schema({
    id: {type: String}
});


var currentMatch = new Schema({
    id: {type: String}
});


var savedDeal = new Schema({
    id: {type: String}
});

var userRoles = {
    ADMIN: 0,
    CLIENT: 1
};

var ADMIN_KEY = "aahh667ttuusfdhrlaksd";


var user = new Schema({
    id: {type: String, required: true, unique: true},
    userType: {type: Number},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profileURl: {type: String, required: false},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    location: {type: String, required: true},
    cords: {type: [Number], required: false, default: [0, 0], index: '2dsphere'}, //// [<longitude>, <latitude>]
    currentListings: [currentListing],
    currentMatches: [currentMatch],
    savedDeals: [savedDeal],
    listingsRemaining: {type: Number, default: 5},
    listingsUsed: {type: Number, default: 0},
    accountCreated: {type: Date, default: Date.now()},
    updateDate: {type: Date, default: Date.now()},
    whatsApp: {type: String},
    telegram: {type: String},
    phoneNumber: {type: String},
    skype: {type: String},
    blocked: {type: Boolean, 'default': false},
    verified: {type: Boolean, 'default': false},
    emailVerified: {type: Boolean, 'default': false},
    pwResetToken: {type: String, 'default': "", required: false},//token to set or reset password used for email
    pwResetOTP: {type: String, 'default': "", required: false},//OTP to set or reset password used for email
    otpDate: {type: Number, required: false}///date when OTP updated or generated
});
user.pre('save', function (next) {
    var user = this;

    if (this.userType == userRoles.ADMIN) {
        this.verified = true;
    }
    if (user.isModified('firstName')) {
        this.name = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1);
    }
    if (user.isModified('lastName')) {
        this.name = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1);
    }
    // only hash the password if it has been modified (or is new) || is no password here
    if (!user.isModified('password') || AppUtil.isStringEmpty(user.password))
        return next();
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err)
            return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt,null, function (err, hash) {
            if (err)
                return next(err);

            // override the clear text password with the hashed one
            user.password = hash;
            next();
        });
    });
});

user.index({cords: '2dsphere'});

user.methods.isBlocked = function () {
    return this.blocked == true;
};

user.methods.comparePassword = function (candidatePassword, cb) {
    if (!bcrypt) {
        cb(null, this.password === candidatePassword);
    } else {
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
            if (err)
                return cb(err);
            cb(null, isMatch);
        });
    }
};

exports.USER = mongoose.model('User', user);
exports.USER_ROLES = userRoles;
exports.ADMIN_KEY = ADMIN_KEY;


