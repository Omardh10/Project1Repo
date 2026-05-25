const mongoose = require('mongoose');
const joi = require('joi');
const ChiledAccountSchema = new mongoose.Schema({
  
    student_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },

    parent_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent', 
        required: true 
    },
    age_group: {
        type: String,
        required: true
    }
}, { timestamps: true });


const ChiledAccount = mongoose.model('ChiledAccount', ChiledAccountSchema);

const validatecreatechildaccount = (obj) => {
    const schema = joi.object({
        student_id: joi.string().required(),
        parent_id: joi.string().required(),
        age_group: joi.string().required()
    })
    return schema.validate(obj)
}

const validateupdatechildaccount = (obj) => {
    const schema = joi.object({
        student_id: joi.string(),
        parent_id: joi.string(),
        age_group: joi.string()
    })
    return schema.validate(obj)
}

module.exports = {
    ChiledAccount,
    validatecreatechildaccount,
    validateupdatechildaccount
};
