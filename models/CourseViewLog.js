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

const validatecreatecourseviewlog = (obj) => {
    const schema = joi.object({
        course_id: joi.string().required(),
        viewed_at: joi.date().default(Date.now)
    })
    return schema.validate(obj)
}

const validateupdatecourseviewlog = (obj) => {
    const schema = joi.object({
        course_id: joi.string(),
        viewed_at: joi.date().default(Date.now)
    })
    return schema.validate(obj)
}

module.exports = {
    CourseViewLog,
    validatecreatecourseviewlog,
   validateupdatecourseviewlog
};