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

const validatecreateparent = (obj) => {
    const schema = joi.object({
        userId: joi.string().required()
    })
    return schema.validate(obj)
}

const validateupdateparent = (obj) => {
    const schema = joi.object({
        userId: joi.string()
    })
    return schema.validate(obj)
}

module.exports = {
    Parent,
    validatecreateparent,
    validateupdateparent
};
