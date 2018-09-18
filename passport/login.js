const User = require('../models/user').USER;
const bCrypt = require('bcrypt-nodejs');
const JsonStrategy = require('passport-json').Strategy;
const logger = require('../logger');

const isValidPassword = (user, password) => {
    logger.debug(user);
    logger.debug('Password: ', password)
    return bCrypt.compareSync(password, user.password);
}

module.exports = (passport) => {
    passport.use('login', new JsonStrategy({
            passReqToCallback: true,
            allowEmptyPasswords: false
        }, (req, username, password, done) => {

            email = req.body.email;
            //This function is called when the user logs in via their email
            logger.info('Attempting to sign in with email: ', email);

            const searchCondition = [
                {email: {$regex: new RegExp("^" + email.toLowerCase(), "i")}}
            ];
            // check in mongo if a user with email exists or not
            User.findOne({$or: searchCondition}).then(user => {
                // Username does not exist, log the error and redirect back
                if (!user) {
                    logger.error('User Not Found with email: ' + email);
                    return done(null, false, logger.debug('here we are'));
                }

                // User exists but wrong password, log the error
                if (!isValidPassword(user, password)) {
                    logger.error('Invalid Password');
                    return done(null, false, logger.debug('You enetered: ', password, ' Needed to have: ', user.password));
                }

                // User and password both match, return user from done method
                // which will be treated like success
                logger.info('Passport login with email was a success');
                return done(null, user);
            }).catch(err => {
                // In case of any error, return using the done method
                logger.error('Error in the passport');
                logger.error(err);
                return done(err);
            });
        }
    ));
};

