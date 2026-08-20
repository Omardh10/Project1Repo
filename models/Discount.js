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


module.exports = {
    Discount,
};