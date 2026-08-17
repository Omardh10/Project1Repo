const mongoose = require('mongoose');
const joi = require('joi');

const ChiledAccountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    parent_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent', 
        required: true 
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, { timestamps: true });

const ChiledAccount = mongoose.model('ChiledAccount', ChiledAccountSchema);

const validatecreatechildaccount = (obj) => {
    const schema = joi.object({
        name: joi.string().trim().required(),
        age: joi.number().positive().required(),
        parent_id: joi.string().required()
    });
    return schema.validate(obj);
};

const validateupdatechildaccount = (obj) => {
    const schema = joi.object({
        name: joi.string().trim(),
        age: joi.number().positive(),
        parent_id: joi.string()
    });
    return schema.validate(obj);
};

module.exports = {
    ChiledAccount,
    validatecreatechildaccount,
    validateupdatechildaccount
};