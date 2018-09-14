'use strict';

var express = require('express');
var router = express.Router();
var authController = require('../controllers').authController;
const passport = require('passport');

router.post('/login',  passport.authenticate('login', { failWithError: true }), [
	authController.loginUser
]);

module.exports = router;
