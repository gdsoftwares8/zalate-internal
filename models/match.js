var mongoose = require('mongoose');


var deal = new mongoose.Schema({
	id: {type: String, required: true},
	type: {type: String, required: true},
	quantity: {type: Number, required: true},
	country: {type: String},
	description: {type: String, required: true},
	position: {type: String, required: true},
	gross: {type: Number, required: true},
	net: {type: Number},
	escrow: {type: String},
	verified: {type: Boolean, default: false},
	posterId: {type: String, required: true},
	dateCreated: {type: Date}
});




module.exports = mongoose.model('Match',{
	id: {type: String, required: true, unique: true},
	dealId: {type: String, required: true},
	buyerSideId: {type: String, required: true},
	sellerSideId: {type: String, required: true},
	dateCreated: {type: Date, default: Date.now()},
	creatorId: {type: String, required: true},
	details: {type: String},
	referencedDeal: [deal],
	chatCreated: {type: Boolean, default: false}
});
