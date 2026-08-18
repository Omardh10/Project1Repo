const mongoose = require('mongoose');
const joi = require('joi');
const DiscountSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    discount_precentage:{
        type:Number,
        required:true
    }
},{timestamps:true});
const Discount = mongoose.model('Discount', DiscountSchema);

const validatecreateDiscount = (obj) => {
    const schema = joi.object({
        code: joi.string().required(),
        discount_precentage: joi.number().required()
    })
    return schema.validate(obj)
}


module.exports = {
    Discount,
    validatecreateDiscount,
};