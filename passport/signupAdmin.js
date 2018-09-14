var JsonStrategy = require('passport-json').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

    passport.use('signupadmin', new JsonStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            if(req.body.adminkey=='aahh667ttuusfdhrlaksd'){

                email = req.body.email;
        
                console.log('Attempting to sign up email: '+email);

                findOrCreateUser = function(){
                // find a user in Mongo with provided username
                User.findOne({ 'email' :  email }, function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in Sign Up: '+err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with email: ' + email);
                        return done(null, false, console.log('message','User Already Exists'));
                    } else {

                       // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        var setPassword = createHash(password)

                        newUser.id = req.body.id;
                        newUser.password = setPassword;
                        newUser.email = email;
                        newUser.role = 'admin';
                        newUser.firstName = req.body.firstName;
                        newUser.lastName = req.body.lastName;
                        newUser.location = req.body.location;
                        newUser.whatsApp = req.body.whatsApp;
                        newUser.telegram = req.body.telegram;
                        newUser.phoneNumber = req.body.phoneNumber;
                        newUser.skype = req.body.skype;



                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Registration succesful');    
                            return done(null, newUser);
                        });
                   }
               });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);

        }
        else{
            console.log('FAKE admin');
            return done();
        }

    })
    );

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}