const mongoose = require('mongoose');
const joi = require('joi');
const StudentAnswerSchema = new mongoose.Schema({
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    is_correct: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const StudentAnswer = mongoose.model('StudentAnswer', StudentAnswerSchema);

const validatecreatestudentanswer = (obj) => {
    const schema = joi.object({
        question_id: joi.string().required(),
        student_id: joi.array().items(joi.string()).required(),
        answer: joi.string().required(),
        is_correct: joi.boolean()
    })
    return schema.validate(obj)
}

const validateupdatestudentanswer = (obj) => {
    const schema = joi.object({
        question_id: joi.string(),
        student_id: joi.array().items(joi.string()),
        answer: joi.string(),
        is_correct: joi.boolean()
    })
    return schema.validate(obj)
}

module.exports = {
    StudentAnswer,
    validatecreatestudentanswer,
    validateupdatestudentanswer
}
