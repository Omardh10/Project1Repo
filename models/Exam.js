const mongoose = require('mongoose');
const joi = require('joi');
const ExamSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    passing_score: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Exam = mongoose.model('Exam', ExamSchema);

const validatecreateexam = (obj) => {
    const schema = joi.object({
        course_id: joi.string().required(),
        title: joi.string().required(),
        passing_score: joi.number().required()
    })
    return schema.validate(obj)
}

const validateupdateexam = (obj) => {
    const schema = joi.object({
        course_id: joi.string(),
        title: joi.string(),
        passing_score: joi.number()
    })
    return schema.validate(obj)
}

module.exports = {
    Exam,
    validatecreateexam,
    validateupdateexam
}