"use strict";

const User = require('../models/user');
const logger = require('../logger');
const jwt = require('jsonwebtoken');

const path = require('path');
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, '../config', 'config.json'))[env];

const createUser = (req, res, next) => {

    return res.status(200).send({message: 'Successfully signed up user'});
}

const loginUser = (req, res, next) => {
    return User.findOne(
        {email: new RegExp('^' + req.body.email.toLowerCase() + '$', 'i')}
    ).then(user => {
        if (!user) {
            logger.error('NO USER FOUND');
            return res.status(404).send({message: 'No user found'})
        }

        logger.debug('USER: ', user);

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
            role: user.role,
            token: jwt.sign({
                exp: Math.floor(Date.now() / 1000) + longSignIn,
                email: user.email,
                role: user.role,
                id: user.id
            }, config.passport.secret)
        });
    }).catch(err => {
        // In case of any error, return using the done method
        logger.error('There is an error', err);
        return next(err);
    })
}


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


module.exports = {
    loginUser: loginUser,
    createUser: createUser,
    verifyJwt: verifyJwt,
}