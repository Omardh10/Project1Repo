const mongoose = require('mongoose');
const joi = require('joi');
const CourseViewLogSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    viewed_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const CourseViewLog = mongoose.model('CourseViewLog', CourseViewLogSchema);

module.exports = CourseViewLog;