'use strict';

var express = require('express');
var router = express.Router();
var authController = require('../controllers').authController;
const passport = require('passport');


var jwt = require('jsonwebtoken');
const User = require('../models/user').USER;

router.post('/login', passport.authenticate('login', {failWithError: true}), [
    authController.loginUser
]);

router.post('/admin/verifyClient', function (req, res) {
    jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function (err, decoded) {
        if (decoded) {
            var clientID = req.body.clientUserID;
            var adminID = req.body.adminUserID;
            User.findOne({id: adminID, userType: 0, verified: true}, function (err, user) {
                if (err) {
                    res.send(500, err);
                } else if (user) {
                    User.findOneAndUpdate({id: clientID}, {verified: true}, function (err, data) {
                        if (err) {
                            res.send(500, err);
                        } else if (data) {
                            res.status(200).send({message: data.firstName + " is now verified!"});
                        } else {
                            res.status(200).send({message: 'No Admin with this user id'});
                        }
                    })
                } else {
                    res.status(200).send({message: 'No Admin with this userID'});
                }
            });
        } else {
            res.send(500, err);
        }
    });


});

module.exports = router;
