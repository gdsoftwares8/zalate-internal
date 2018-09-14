'use strict';

const express = require('express');
const router = express.Router();
const signupRoutes = require('./signup-routes');
const loginRoutes = require('./login-routes');
const indexRoutes = require('./index-routes');
const adminRoutes = require('./adminRoutes');
const accountRoutes = require('./accountRoutes');
const listingRoutes = require('./listingRoutes');
const matchRoutes = require('./matchRoutes');


router.use('/', indexRoutes);
router.use('/authenticate', loginRoutes);
router.use('/register', signupRoutes);
router.use('/admin', adminRoutes);
router.use('/account', accountRoutes);
router.use('/listings', listingRoutes);
router.use('/match', matchRoutes);


module.exports = router;