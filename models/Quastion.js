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

module.exports = {
    Question
}