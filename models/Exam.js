const mongoose = require('mongoose');
const Question = require('./Quastion');
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
    },
    questions: [{
        question_text: {
            type: String,
            required: true,
        },
        options: {
            type: [String],
            required: true,
        },
        correct_answer: {
            type: String,
            required: true,
        }
    }
    ]
}, { timestamps: true });

const Exam = mongoose.model('Exam', ExamSchema);

const validatecreateexam = (obj) => {
    const schema = joi.object({
        course_id: joi.string().required(),
        title: joi.string().required(),
        passing_score: joi.number().required(),
        questions: joi.array().required()
    })
    return schema.validate(obj)
}

const validateupdateexam = (obj) => {
    const schema = joi.object({
        course_id: joi.string(),
        title: joi.string(),
        passing_score: joi.number(),
        questions: joi.array()
    })
    return schema.validate(obj)
}

module.exports = {
    Exam,
    validatecreateexam,
    validateupdateexam
}