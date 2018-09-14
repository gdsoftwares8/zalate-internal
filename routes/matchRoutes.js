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
var Match = require('../models/match');

//User create a match request
router.post('/new/:id', function(req, res){
	jwt.verify(req.headers.token, 'fry1egg2secret1json5565b5a5', function(err, decoded) {
		if (decoded){
			
			User.findOne({id: decoded.id}, function(err, user){
				if(err){res.json(err)}
				if(!user && !err){res.json({message: 'No user or err'})}
				if(user){
					Deal.findOne({id: req.params.id}, function(err, deal){
						if(err){res.json(err)}
						if(!err && !deal){res.json({message: 'No deal or error'})}
						if(deal){

							let requestParty = user;
							let newMatch = new Match();
							if(deal.type == 'buy'){
								newMatch.sellerSideId = user.id;
								newMatch.buyerSideId = deal.posterId;
							}
							if(deal.type == 'sell'){
								newMatch.sellerSideId = deal.posterId;
								newMatch.buyerSideId = user.id;
							}

							newMatch.id = Date.now();
							newMatch.dealId = req.params.id;
							newMatch.creatorId = user.id;
							newMatch.details = req.body.details;
							newMatch.referencedDeal.push(deal);

							newMatch.save(function(err, returned){
								if(err){res.json(err)}
								if(!err && !returned){res.json({message: 'No err or returned'})}
								if(returned){

									user.currentMatches.push({id: newMatch.id});
									user.save(function(err, user2){
										if(err){res.json(err)}
										if(user2){
											res.json({message: 'Successfully created match'})
										}	
									});

									
								}	
							})
							

							if(deal.type != 'sell' && deal.type != 'buy'){
								res.json({message: 'Error with deal type'})
							}	
						}	
					})
				}	
			})

		}
		if (err){
			console.log(err);
			res.json(err);
		}	
	})
});










module.exports = router;
