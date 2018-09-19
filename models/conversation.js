/**
 * @author vishwas vaishnav
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const ChatType = {
    Personal: 0,
    Group: 1,
    BroadcastGroup: 2,
    Anonymous: 3,
    Incognito: 4,
    Support:5
};

var conversation = new Schema({
    convoName: {type: String, required: false},
    adminID: {type: String, required: true, index: true,ref: 'User'},//who created convo ie. The Admin
    initDate: {type: Number, required: true},
    lastDate: {type: Number, required: true},
    chatType: {type: Number, required: true},
    users: [{type: String, required: true, ref: 'User'}]
});


exports.Conversation = mongoose.model('Conversation', conversation);
exports.ChatType = ChatType;
