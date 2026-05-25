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

const validatecreatereview = (obj) => {
    const schema = joi.object({
        student_id: joi.string().required(),
        course_id: joi.string().required(),
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().max(150)
    })
    return schema.validate(obj)
}

const validateupdatereview = (obj) => {
    const schema = joi.object({
        student_id: joi.string(),
        course_id: joi.string(),
        rating: joi.number().min(1).max(5),
        comment: joi.string().max(150)
    })
    return schema.validate(obj)
}

module.exports = {
    Review,
    validatecreatereview,
    validateupdatereview
};