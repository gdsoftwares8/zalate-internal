'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers').authController;
const passport = require('passport');

router.post('/signup', passport.authenticate('signup', { failWithError: true }), [
	authController.createUser
]);

router.post('/admin', passport.authenticate('signupadmin', { failWithError: true }), [
	authController.createUser
]);

router.post('/hello', function (req, res) {
    res.status(200).send('Whats up');
});



module.exports = router;
