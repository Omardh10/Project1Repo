const mongoose = require('mongoose');
const joi = require('joi');
const reportSchema = new mongoose.Schema({
  
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
    report_data: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

const validatecreatereport = (obj) => {
    const schema = joi.object({
        student_id: joi.string().required(),
        parent_id: joi.string().required(),
        report_data: joi.string().required()
    })
    return schema.validate(obj)
}

const validatupdatereport = (obj) => {
    const schema = joi.object({
        student_id: joi.string(),
        parent_id: joi.string(),
        report_data: joi.string()
    })
    return schema.validate(obj)
}

module.exports = {
    Report,
    validatecreatereport,
    validatupdatereport
};
