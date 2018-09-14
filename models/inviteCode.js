var mongoose = require('mongoose');




module.exports = mongoose.model('InviteCode',{
	id: {type: String, required: true},
	expires: {type: Date}
});