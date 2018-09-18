'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers').authController;
const userController = require('../controllers').userController;
const AppUtil = require('../controllers/AppUtill');
var User = require('../models/user');


router.get('/', function (req, res) {
    res.status(200).send('Home Page');
});

router.post('/information', [
    authController.verifyJwt,
    (req, res) => {
        return res.json({
            data: true,
            email: req.verifiedUser.email
        });
    }
]);

router.post('/api/verifyOtp', function (req, res) {
    var email = req.param('email');
    var password = req.param('password');
    var token = req.param('token');
    var otp = req.param('otp');
    if (!AppUtil.isStringEmpty(email) && !AppUtil.isStringEmpty(password) && !AppUtil.isStringEmpty(otp) && !AppUtil.isStringEmpty(token)) {
        var selection = 'username verified pwResetToken pwResetOTP email';
        User.findOne({email: email}, selection, function (err, user) {
            if (err) {
                Logger.error(err);
                res.send(500, err);
            } else if (user) {
                if (user.verified) {
                    res.status(200).send('Already verified!');
                } else if (user.pwResetToken == token && user.pwResetOTP == otp) {
                    user.verified = true;
                    user.save(function (err, dbUser) {
                        //console.log('save user  is here YO',dbUser);
                        if (err) {
                            Logger.error(err);
                            res.send(500, err);
                        } else {
                            if (dbUser) {
                                res.status(200).send('Succesfully Verified!');
                            } else {
                                res.status(200).send('Please Try Again');
                            }
                        }
                    });
                } else {
                    res.status(200).send('Wrong Otp Entered');
                }
            } else {//this should not come
                res.status(200).send('Invalid Email');
            }
        });
    } else {
        res.send(400)
    }
});


/**
 * Searches if a email is already taken
 */
router.get('/searchemail/:email', [
    userController.checkEmail
]);

module.exports = router;
