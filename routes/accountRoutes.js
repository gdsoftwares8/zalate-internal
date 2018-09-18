'use strict';

var express = require('express');
var router = express.Router();
var authController = require('../controllers').authController;
const passport = require('passport');
var jwt = require('jsonwebtoken');
const logger = require('../logger');
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');




//User reset password while logged in
router.put('/password', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			User.findOne({email: decoded.email}, function(){
				console.log('Found user with email: ', decoded.email);
				console.log('New password is: ', req.body.newPassword)
				if(req.body.newPassword != null && req.body.newPassword != undefined){
					var setPassword = bCrypt.hashSync(req.body.newPassword, bCrypt.genSaltSync(10), null);
					User.findOneAndUpdate({email: decoded.email}, {password: setPassword}, function(err, user){
						if(err){
							res.json(err)
						}
						if(!user && !err){
							res.json({message: 'No error or user'});
						}
						if(user){
							console.log(setPassword);
							console.log(user)
							res.json({message: 'Successfully updated password'})  
						}
					})
				}
				if(req.body.newPassword == null || req.body.newPassword == undefined){
					res.json({message: "Must enter password"})
				}
				
			})
		}
		if (err){
			console.log(err);
		}	
	})
});





//User update account information
router.put('/update', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			User.findOne({email: decoded.email}, function(err, user){
				if(err){res.json(err)}
				if(!err && !user){res.json({message: 'No err or user'})}	
				if(user){
					user.location = req.body.location;
					user.whatsApp = req.body.whatsApp;
					user.telegram = req.body.telegram;
					user.phoneNumber = req.body.phoneNumber;
					user.skype = req.body.skype;
					user.save(function(err, newuser){
						if(err){res.json(err)}
						if(!err && !newuser){res.json({message: 'Not err or newuser'})}
						if(newuser){
							res.json({
										message: 'User account information successfully updated',
										user: newuser
									})
						}	
					})
				}
			})
		}
		if (err){
			console.log(err);
		}	
	})
});



//Admin view all users
router.get('/all', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			User.find({}, function(err, user){
				if(err){res.json(err)}
				if(!err && !user){res.json({message: 'No err or user'})}	
				if(user){
					res.json(user)
				}
			})
		}
		if (err){
			console.log(err);
		}	
	})
});



//User view their profile
router.get('/profile', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			User.findOne({id: decoded.id}, function(err, user){
				if(err){res.json(err)}
				if(!err && !user){res.json({message: 'No err or user'})}	
				if(user){
					res.json(user)
				}
			})
		}
		if (err){
			console.log(err);
		}	
	})
});












module.exports = router;
