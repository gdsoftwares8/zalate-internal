var mongoose = require('mongoose');


var currentListing = new mongoose.Schema({
    id: {type: String}
});


var currentMatch = new mongoose.Schema({
    id: {type: String}
});


var savedDeal = new mongoose.Schema({
    id: {type: String}
});


module.exports = mongoose.model('User', {
    id: {type: String, required: true, unique: true},
    role: {type: String},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    location: {type: String, required: true},
    currentListings: [currentListing],
    currentMatches: [currentMatch],
    savedDeals: [savedDeal],
    listingsRemaining: {type: Number, default: 5},
    listingsUsed: {type: Number, default: 0},
    accountCreated: {type: Date, default: Date.now()},
    whatsApp: {type: String},
    telegram: {type: String},
    phoneNumber: {type: String},
    skype: {type: String},
    verified: {type: Boolean, 'default': false},
    pwResetToken: {type: String, 'default': "", required: false},//token to set or reset password used for email
    pwResetOTP: {type: String, 'default': "", required: false},//OTP to set or reset password used for email
    otpDate: {type: Number, required: false}///date when OTP updated or generated
});