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
module.exports = {
    Admin
};