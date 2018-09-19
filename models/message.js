/**
 * @author vishwas vaishnav
 *
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var message =  new Schema({
    from:{ type: ObjectId, required: true,ref: 'User' },
    conversationID:{ type: ObjectId, required: true,ref: 'Conversation'  },
    date:{type:Number,required:true,index: true},
    message:{type:String,required:false,'default':""},
});
exports.Message = mongoose.model('Message', message);