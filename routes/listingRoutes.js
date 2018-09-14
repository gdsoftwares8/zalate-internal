'use strict';

var express = require('express');
var router = express.Router();
var authController = require('../controllers').authController;
const passport = require('passport');
var InviteCode = require('../models/inviteCode');
var jwt = require('jsonwebtoken');
const logger = require('../logger');
var User = require('../models/user');
var Deal = require('../models/deal');
var bCrypt = require('bcrypt-nodejs');




//User reset password while logged in
router.post('/new', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			
			var newDeal = new Deal();
			var specialId = decoded.email.substring(1, 4) + Date.now();
			newDeal.id = specialId;
			newDeal.type = req.body.type;
			newDeal.country = req.body.country;
			newDeal.description = req.body.description;
			newDeal.position = req.body.position;
			newDeal.quantity = req.body.quantity;
			newDeal.gross = req.body.gross;
			newDeal.net = req.body.net;
			newDeal.escrow = req.body.escrow;
			newDeal.posterId = decoded.id;

			User.findOne({email: decoded.email}, function(err, firstuser){
				if(err){res.json(err)}
					if(!err && !firstuser){res.json({message: 'No error or firstuser'})}
						if(firstuser){
							if(firstuser.listingsRemaining <= 0){res.json({message: 'No listing slots remaining'})}
								if(firstuser.listingsRemaining > 0){

									newDeal.save(function(err, saveddeal){
										if(err){res.json(err)}
											if(!err && !saveddeal){res.json({message: 'No error or saveddeal'})}
												if(saveddeal){

													User.findOne({email: decoded.email}, function(err, user){
														if(err){res.json(err)}
															if(!err && !user){
																res.json({message: 'No user or error'})
															}	
															if(user){
																user.currentListings.push(saveddeal);
																user.listingsUsed++;
																user.listingsRemaining--;
																user.save(function(err, user2){
																	if(err){res.json(err)}
																		if(!err && !user2){
																			res.json({message: 'no user or error 2'})
																		}	
																		if(user2){
																			res.json({message: 'Successfully completed adding deal'})
																		}
																	})
															}
														})
												}	
											})
								}	
							}	
						})
		}
		if (err){
			console.log(err);
		}	
	})
});




//Delete a deal if you are the admin or owner of the deal
router.delete('/old/:id', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			
			Deal.findOne({id: req.params.id}, function(err, deal){
				if(err){res.json(err)}
				if(!err && !deal){res.json({message: 'No deal or err'})}
				if(deal){
					User.findOne({id: deal.posterId}, function(err, user){
						if(err){res.json(err)}
						if(!err && !user){res.json({message: 'No error or user found'})}
						if(user){
							if(deal.posterId == decoded.id || decoded.role == 'admin'){
								Deal.findOneAndRemove({id: req.params.id}, function(err, olddeal){
									if(err){res.json(err)}
									if(!err && !olddeal){res.json({message: 'No error or old deal'})}
									if(olddeal){
										user.listingsUsed--;
										user.listingsRemaining++;

										var removeIndex = user.currentListings.map(function(item) { return item.id; }).indexOf(req.params.id);
										user.currentListings.splice(removeIndex, 1);

										user.save(function(err, newuser){
											if(err){res.json(err)}
											if(!err && !newuser){
												res.json({message: 'No err or newuser'})
											}	
											if(newuser){
												res.json({message: 'Deal deleted successfully'})
											}
										})
									}	
								})
							}
							if(deal.posterId != decoded.id && decoded.role != 'admin'){
								res.json({message: 'Not correct id token to delete this'})
							}	
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



//Update old deal information
router.put('/old/:id', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			
			Deal.findOne({id: req.params.id}, function(err, deal){
				if(err){res.json(err)}
				if(!err && !deal){res.json({message: 'No deal or err'})}
				if(deal){
					User.findOne({id: deal.posterId}, function(err, user){
						if(err){res.json(err)}
						if(!err && !user){res.json({message: 'No error or user found'})}
						if(user){
							if(deal.posterId == decoded.id || decoded.role == 'admin'){
								deal.type = req.body.type;
								deal.country = req.body.country;
								deal.description = req.body.description;
								deal.position = req.body.position;
								deal.quantity = req.body.quantity;
								deal.gross = req.body.gross;
								deal.net = req.body.net;
								deal.escrow = req.body.escrow;
								deal.posterId = decoded.id;
								deal.save(function(err, newdeal){
									if(err){res.json(err)}
									if(!err && !newdeal){
										res.json({message: 'Not error or newdeal'})
									}
									if(newdeal){
										res.json({message: 'Deal updated successfully'})
									}	
								})
							}
							if(deal.posterId != decoded.id && decoded.role != 'admin'){
								res.json({message: 'Not correct id token to edit this'})
							}	
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





//User get all deal listings while logged in
router.get('/browse', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			
			Deal.find({}, function(err, deal){
				if(err){res.json(err)}
				if(!err && !deal){res.json({message: 'No deal or err'})}
				if(deal){
					res.json(deal)
				}	
			})

			
		}
		if(!err && !decoded){res.json({message: 'no error or decoded'})}
		if (err){
			console.log(err);
		}	
	})
});






//Admin create a new invite code for nrw users to register
	router.post('/invite', function(req, res){
		jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
			if (decoded){
				if (decoded.role=='admin'){
					console.log('Decoded admin');
					var newInvite = new InviteCode();
					newInvite.id = req.body.id;
				//Save Invite Code
				newInvite.save(function (err) {
					if (err) {
						logger.error('Error in saving invite code: ' + err);
						throw err;
					}
					else{
						logger.info('Invite code creation succesful');
						console.log('Invite Code Sccessfully Made')
						res.json({
							message: 'Success with code creation'
						});
					}
				});
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







	module.exports = router;