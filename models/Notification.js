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

const validatecreatenotification = (obj) => {
    const schema = joi.object({
        userId: joi.string().required(),
        message: joi.string().required(),
        isRead: joi.boolean().required()
    })
    return schema.validate(obj)
}

const validatupdatenotification = (obj) => {
    const schema = joi.object({
        userId: joi.string(),
        message: joi.string(),
        isRead: joi.boolean()
    })
    return schema.validate(obj)
}

module.exports = {
    Notification,
    validatecreatenotification,
    validatupdatenotification
};