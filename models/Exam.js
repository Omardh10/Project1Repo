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
module.exports = {
    Exam
}