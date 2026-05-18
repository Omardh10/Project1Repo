const mongoose = require('mongoose');
const joi = require('joi');
const ParentSchema = new mongoose.Schema({
      userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
},{timestamps:true});
const Parent = mongoose.model('Parent', ParentSchema);
module.exports = {
    Parent
};