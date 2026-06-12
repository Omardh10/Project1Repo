const mongoose = require('mongoose');
const joi = require('joi');
const ModelCourseSchema = new mongoose.Schema({

    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }]

}, { timestamps: true });


const ModelCourse = mongoose.model('ModelCourse', ModelCourseSchema);

const validatecreatemodelcourse = (obj) => {
    const schema = joi.object({
        teacher_id: joi.string().required(),
        courses: joi.array().items(joi.string()).required()
    })
    return schema.validate(obj)
}

const validatupdatemodelcourse = (obj) => {
    const schema = joi.object({
        teacher_id: joi.string(),
        courses: joi.array().items(joi.string())
    })
    return schema.validate(obj)
}

module.exports = {
    validatecreatemodelcourse,
    validatupdatemodelcourse
};
