var mongoose = require('mongoose');







module.exports = mongoose.model('Deal',{
	id: {type: String, required: true, unique: true},
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
	dateCreated: {type: Date, default: Date.now()}
});