'use strict';

var express = require('express');
var router = express.Router();
var authController = require('../controllers').authController;
const passport = require('passport');
var jwt = require('jsonwebtoken');
const logger = require('../logger');
var User = require('../models/user');
var Match = require('../models/match');






//Admin delete a user
router.delete('/user/:email', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			if (decoded.role=='admin'){
				console.log('Decoded');
				User.findOneAndRemove({email: req.params.email}, function(err, invite){
					if(err){
						console.log(err);
						res.json(err);
					}
					if(invite){
						res.json({
							message: 'Deleted it: '+invite
						})
					}
				})
			}
			if(decoded.role!='admin'){
				res.json({
					message: 'admin permission required'
				})
			}
		}
		if (err){
			console.log(err);
            res.json(err);
		}	
	})
});




//Admin view all matches
router.get('/matches/all', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			if (decoded.role=='admin'){
				console.log('Decoded');
				Match.find({}, function(err, deal){
					if(err){res.json(err)}
						if(!err && !deal){res.json({message: 'No deal or err'})}
							if(deal){
								res.json(deal)
							}	
						})
			}
			if(decoded.role!='admin'){
				res.json({
					message: 'admin permission required'
				})
			}
		}
		if(!err && !decoded){res.json({message: 'no error or decoded'})}
			if (err){
				console.log(err);
                res.json(err);
			}	
		})
});




//Admin mark match as chat created
router.post('/matches/made/:id', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			if (decoded.role=='admin'){
				console.log('Decoded');
				Match.findOneAndUpdate({id: req.params.id}, {chatCreated: true}, function(err, deal){
					if(err){res.json(err)}
						if(!err && !deal){res.json({message: 'No deal or err'})}
							if(deal){
								res.json({message: 'Successfully marked as read'})
							}	
						})
			}
			if(decoded.role!='admin'){
				res.json({
					message: 'admin permission required'
				})
			}
		}
		if(!err && !decoded){res.json({message: 'no error or decoded'})}
			if (err){
				console.log(err);
                res.json(err);
			}	
		})
});





module.exports = router;
