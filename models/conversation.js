/**
 * @author vishwas vaishnav
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var conversation = new Schema({
    name: {type: String, required: false},
    initDate: {type: Number, required: true},
    groupNamed: {type: Boolean, 'default': true, required: false},
    users: [{type: ObjectId, required: true, ref: 'User'}] //participants
});

exports.Conversation = mongoose.model('Conversation', conversation);
