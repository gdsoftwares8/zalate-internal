'use strict';

var express = require('express');
var router = express.Router();
var authController = require('../controllers').authController;
const passport = require('passport');
var jwt = require('jsonwebtoken');
const logger = require('../logger');
var User = require('../models/user').USER;
var bCrypt = require('bcrypt-nodejs');
var Response = require('../controllers/Response');
var MAX_DATA_LIMIT = 15;
var AppUtil = require('../controllers/AppUtill');

//User reset password while logged in
router.put('/password', function (req, res) {
    jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function (err, decoded) {
        if (decoded) {
            User.findOne({email: decoded.email}, function () {
                console.log('Found user with email: ', decoded.email);
                console.log('New password is: ', req.body.newPassword)
                if (req.body.newPassword != null && req.body.newPassword != undefined) {
                    var setPassword = bCrypt.hashSync(req.body.newPassword, bCrypt.genSaltSync(10), null);
                    User.findOneAndUpdate({email: decoded.email}, {password: setPassword}, function (err, user) {
                        if (err) {
                            res.json(err)
                        }
                        if (!user && !err) {
                            res.json({message: 'No error or user'});
                        }
                        if (user) {
                            console.log(setPassword);
                            console.log(user)
                            res.json({message: 'Successfully updated password'})
                        }
                    })
                }
                if (req.body.newPassword == null || req.body.newPassword == undefined) {
                    res.json({message: "Must enter password"})
                }

            })
        }
        if (err) {
            console.log(err);
        }
    })
});


//User update account information
router.put('/update', function (req, res) {
    jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function (err, decoded) {
        if (decoded) {
            User.findOne({email: decoded.email}, function (err, user) {
                if (err) {
                    res.json(err)
                }
                if (!err && !user) {
                    res.json({message: 'No err or user'})
                }
                if (user) {
                    user.location = req.body.location;
                    user.whatsApp = req.body.whatsApp;
                    user.telegram = req.body.telegram;
                    user.phoneNumber = req.body.phoneNumber;
                    user.skype = req.body.skype;
                    user.save(function (err, newuser) {
                        if (err) {
                            res.json(err)
                        }
                        if (!err && !newuser) {
                            res.json({message: 'Not err or newuser'})
                        }
                        if (newuser) {
                            res.json({
                                message: 'User account information successfully updated',
                                user: newuser
                            })
                        }
                    })
                }
            })
        }
        if (err) {
            console.log(err);
        }
    })
});


//Admin view all users
router.get('/all', function (req, res) {
    jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function (err, decoded) {
        if (decoded) {
            var pageNo = req.query.page || 1;
            var limit = req.query.limit || MAX_DATA_LIMIT;
            if (AppUtil.isNumber(limit)) {
                limit = limit > MAX_DATA_LIMIT ? MAX_DATA_LIMIT : parseInt(limit);
            } else {
                limit = 20;
            }
            if (AppUtil.isNumber(pageNo)) {
                pageNo = pageNo < 1 ? 1 : parseInt(pageNo);
            } else {
                pageNo = 1;
            }
            var userType = req.query.userType;
            var query;
            if (userType == -1) {
                query = {};
            } else {
                query = {userType: userType};
            }
            User.count(query, function (err, count) {
                if (err) {
                    Logger.error(err);
                    res.send(500);
                } else {
                    limit = limit <= MAX_DATA_LIMIT ? limit : MAX_DATA_LIMIT;
                    var options = {
                        skip: ((pageNo - 1) * limit),
                        limit: limit,
                        sort: {createDate: -1}
                    };
                    User.find(query, {}, options, function (err, user) {
                        if (err) {
                            res.send(500, err);
                        } else if (user) {
                            var message = "Users Successfully Retrived!";
                            var response = Response.createResponse(Response.RequestStatus.Success, message, user, count, limit);
                            res.status(200).json(response);
                        } else {
                            message = "No User found!";
                            response = Response.createResponse(Response.RequestStatus.Fail, message, []);
                            res.status(200).json(response);
                        }
                    })
                }
            });

        } else if (err) {
            res.send(500, err);
        } else {
            res.send(500, err);
        }
    });
});


//User view their profile
router.get('/profile', function (req, res) {
    jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function (err, decoded) {
        if (decoded) {
            User.findOne({id: decoded.id}, function (err, user) {
                if (err) {
                    res.json(err)
                }
                if (!err && !user) {
                    res.json({message: 'No err or user'})
                }
                if (user) {
                    res.json(user)
                }
            })
        }
        if (err) {
            console.log(err);
        }
    })
});


module.exports = router;
