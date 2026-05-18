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

module.exports = Transaction;   