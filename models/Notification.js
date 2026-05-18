const mongoose = require('mongoose');
const joi = require('joi');
const NotificationSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    message:{
        type:String,
        required:true
    },
    isRead:{
        type:Boolean,
        required:true
    }
},{timestamps:true});
const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = {
    Notification
};