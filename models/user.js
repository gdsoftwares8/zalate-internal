/**
 * Created by Vishwas on 17-09-2018.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


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


var user = new Schema({
    id: {type: String, required: true, unique: true},
    role: {type: Number},
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
    verified: {type: Boolean, 'default': false},
    pwResetToken: {type: String, 'default': "", required: false},//token to set or reset password used for email
    pwResetOTP: {type: String, 'default': "", required: false},//OTP to set or reset password used for email
    otpDate: {type: Number, required: false}///date when OTP updated or generated
});
user.pre('save', function (next) {
    var user = this;
    if (this.isNew && Array.isArray(this.cords) && 0 === this.cords.length) {
        this.cords = undefined;
    }

    // capitalize
    if (user.isModified('firstName')) {
        this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }
    if (user.isModified('lastName')) {
        this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }
    return next();
});

user.index({cords: '2dsphere'});

user.methods.isBlocked = function () {
    return this.blocked == true;
};

exports.USER = mongoose.model('User', user);
exports.USER_ROLES = userRoles;


