const mongoose = require('mongoose');
const joi = require('joi');
const AdminSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    platform_fee_precentage:{
        type:Number,
        required:true
    }
},{timestamps:true});
const Admin = mongoose.model('Admin', AdminSchema);

const validatecreateadmin = (obj) => {
    const schema = joi.object({
        userId: joi.string().required(),
        platform_fee_precentage: joi.number().required()
    })
    return schema.validate(obj)
}

const validatupdateadmin = (obj) => {
    const schema = joi.object({
        userId: joi.string(),
        platform_fee_precentage: joi.number()
    })
    return schema.validate(obj)
}

module.exports = {
    Admin,
    validatecreateadmin,
    validatupdateadmin
};