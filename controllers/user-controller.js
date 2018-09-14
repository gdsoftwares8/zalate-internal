"use strict";

const User = require('../models/user');
const logger = require('../logger');
const jwt = require('jsonwebtoken');

const path = require('path');
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, '../config', 'config.json'))[env];



const checkEmail = (req, res, next) => {
    return User.findOne({
        email: new RegExp('^' + req.params.email.toLowerCase() + '$', 'i')
    }).then(user => {
        if (!user) {
            logger.info('User Not Found with email ' + req.params.username);
            res.status(200).send('available');
        }

        logger.info('User was Found');
        res.status(200).send('taken');

    }).catch(next);
}


module.exports = {
    checkEmail: checkEmail
}