const mongoose = require('mongoose');
const joi = require('joi');
const QuestionSchema = new mongoose.Schema({
    exam_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
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
}, { timestamps: true });

const Question = mongoose.model('Question', QuestionSchema);

const validatecreatequestion = (obj) => {
    const schema = joi.object({
        exam_id: joi.string().required(),
        question_text: joi.string().required(),
        options: joi.array().items(joi.string()).required(),
        correct_answer: joi.string().required()
    });
    return schema.validate(obj);
}

const validateupdatequestion = (obj) => {
    const schema = joi.object({
        exam_id: joi.string(),
        question_text: joi.string(),
        options: joi.array().items(joi.string()),
        correct_answer: joi.string()
    });
    return schema.validate(obj);
}

module.exports = {
    Question,
    validatecreatequestion,
    validateupdatequestion
}