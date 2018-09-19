/**
 * @author vishwas vaishnav
 *
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var message = new Schema({
    from: {type: String, required: true, ref: 'User'},
    convoID: {type: ObjectId, required: true, ref: 'Conversation'},
    mediaUrl: {type: String, required: false, 'default': ""},
    date: {type: Number, required: true, index: true},
    type: {type: Number, required: true},
    message: {type: String, required: false, 'default': ""},
    status: {type: Number, required: false},
    readers: [{type: String, required: true, ref: 'User'}]
});
exports.Message = mongoose.model('Message', message);
exports.MessageType = {
    TEXT: 0,
    PICTURE: 1,
    VOICE: 2,
    LOCATION: 3,
    EVENT: 4,
    ERROR: 5,
    LINK: 6,
    DOC: 7,
    FILE: 8
};

exports.MessageStatus = {
    SEND_STATUS_SENDING: 0,
    SEND_STATUS_SUCCESS: 1,
    SEND_STATUS_FAIL: 2,
    SEND_STATUS_DELIVERED: 3,
    SEND_STATUS_VIEWED: 4,
    SEND_STATUS_VIEWED_ALL: 5
};