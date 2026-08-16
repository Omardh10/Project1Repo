const mongoose = require('mongoose');
const joi = require('joi');
const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    money_balance: {
        type: Number,
        default: 0,
        required: true
    },
    points_balance: {
        type: Number,
        required: true
    },
    Discount_codes:{
    type: [String],
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
        money_balance: joi.required(),
        enrolled_courses_count: joi.number().required()
    })
    return schema.validate(obj)
}

const validateupdatestudent = (obj) => {
    const schema = joi.object({
        userId: joi.string(),
        points_balance: joi.number(),
        money_balance: joi(),
        enrolled_courses_count: joi.number()    
    })
    return schema.validate(obj)
}


module.exports = {
    Student,
    validatecreatestudent,
    validateupdatestudent
};