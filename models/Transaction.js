const mongoose = require('mongoose');
const joi = require('joi');
const TransactionSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    platform_fee:{
        type:Number,
        required:true
    },
    instructor_earnings:{
        type:Number,
        required:true
    },
    transaction_date: {
        type: Date,
        default: Date.now
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

const validatecreatetransaction = (obj) => {
    const schema = joi.object({
        student_id: joi.string().required(),
        course_id: joi.string().required(),
        amount: joi.number().required().min(0),
        platform_fee: joi.number().required(),
        instructor_earnings: joi.number().required()
    })
    return schema.validate(obj)
}

const validatupdatetransaction = (obj) => {
    const schema = joi.object({
        student_id: joi.string(),
        course_id: joi.string(),
        amount: joi.number().min(0),
        platform_fee: joi.number(),
        instructor_earnings: joi.number()
    })
    return schema.validate(obj)
}

module.exports = {
    Transaction,
    validatecreatetransaction,
    validatupdatetransaction
};