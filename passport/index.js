const login = require('./login');
const User = require('../models/user').USER;

const signupadmin = require('./signupAdmin');
const signup = require('./signup');
const logger = require('../logger');

const initialize = (passport) => {
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser((user, done) => {
        logger.info('Serializing user: ', user);
        return done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => {
            logger.info('deserializing user:', user);
            return done(null, user);
        }).catch(done);
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);
    signupadmin(passport);
}

module.exports = {
    initialize: initialize
}