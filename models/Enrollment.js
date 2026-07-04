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
    completion_status: {
        type: String,
        enum: ['not started', 'in progress', 'completed'],
        default: 'not started'
    },
    certificate_issued: {
        type: Boolean,
        default: false
    },
    completed_lessons: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
         }
    ]
}, { timestamps: true });

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

const validatecreateenrollment = (obj) => {
    const schema = joi.object({
        student_id: joi.string().required(),
        course_id: joi.string().required(),
        progress: joi.number().default(0),
        completion_status: joi.string().valid('not started', 'in progress', 'completed').default('not started'),
        certificate_issued: joi.boolean().default(false),
        completed_lessons: joi.array().items(joi.string())
    })
    return schema.validate(obj)
}

const validateupdateenrollment = (obj) => {
    const schema = joi.object({
        student_id: joi.string(),
        course_id: joi.string(),
        progress: joi.number().default(0),
        completion_status: joi.string().valid('not started', 'in progress', 'completed').default('not started'),
        certificate_issued: joi.boolean().default(false)
    })
    return schema.validate(obj)
}

module.exports = {
    Enrollment,
    validatecreateenrollment,
    validateupdateenrollment
};
