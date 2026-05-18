const mongoose = require('mongoose');
const joi = require('joi');
const QuestionSchema = new mongoose.Schema({
    quastion_text: {
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
        question_text: joi.string().required(),
        options: joi.array().items(joi.string()).required(),
        correct_answer: joi.string().required()
    })
    return schema.validate(obj)
}

const validatupdatequestion = (obj) => {
    const schema = joi.object({
        question_text: joi.string(),
        options: joi.array().items(joi.string()),
        correct_answer: joi.string()
    })
    return schema.validate(obj)
}

module.exports = {
    Question,
    validatecreatequestion,
    validatupdatequestion
}