const mongoose = require('mongoose');
const joi = require('joi');
const EnrollmentSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    complation_status: {
        type: String,
        enum: ['not started', 'in progress', 'completed'],
        default: 'not started'
    },
    certificate_issued: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });   

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
module.exports = {
    Enrollment
}