const mongoose = require('mongoose');
const joi = require('joi');
const ReviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 150
    }
}, { timestamps: true });

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;