const mongoose = require('mongoose');
const joi = require('joi');
const TeacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total_students: {
        type: Number,
        required: true
    },
    total_courses: {
        type: Number,
        required: true
    },
    stetus: {
        type: String,
        enum: ['accepted', 'pending', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });
const Teacher = mongoose.model('Teacher', TeacherSchema);

const validatecreateteacher = (obj) => {
    const schema = joi.object({
        userId: joi.string().required(),
        total_students: joi.number().required(),
        total_courses: joi.number().required()
    })
    return schema.validate(obj)
}

const validateupdateteacher = (obj) => {
    const schema = joi.object({
        userId: joi.string(),
        total_students: joi.number(),
        total_courses: joi.number()
    })
    return schema.validate(obj)
}

module.exports = {
    Teacher,
    validatecreateteacher,
   validateupdateteacher
};