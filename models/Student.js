const mongoose = require('mongoose');
const joi = require('joi');
const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    points_balance: {
        type: Number,
        required: true
    },
    enrolled_courses_count: {
        type: Number,
        required: true
    }
}, { timestamps: true });
const Student = mongoose.model('Student', StudentSchema);

const validatecreatestudent = (obj) => {
    const schema = joi.object({
        userId: joi.string().required(),
        points_balance: joi.number().required(),
        enrolled_courses_count: joi.number().required()
    })
    return schema.validate(obj)
}

const validatupdatestudent = (obj) => {
    const schema = joi.object({
        userId: joi.string(),
        points_balance: joi.number(),
        enrolled_courses_count: joi.number()    
    })
    return schema.validate(obj)
}


module.exports = {
    Student,
    validatecreatestudent,
    validatupdatestudent
};