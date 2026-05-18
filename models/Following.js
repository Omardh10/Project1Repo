const mongoose = require('mongoose');
const joi = require('joi');
const followingSchema = new mongoose.Schema({
  
    student_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },

    teacher_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Teacher', 
        required: true 
    }
}, { timestamps: true });

followingSchema.index({ student_id: 1, teacher_id: 1 }, { unique: true });

const validatecreatefollowing = (obj) => {
    const schema = joi.object({
        student_id: joi.string().required(),
        teacher_id: joi.string().required()
    })
    return schema.validate(obj)
}

const validatupdatefollowing = (obj) => {
    const schema = joi.object({
        student_id: joi.string(),
        teacher_id: joi.string()
    })
    return schema.validate(obj)
}

const Following = mongoose.model('Following', followingSchema);
module.exports = {
    Following,
    validatecreatefollowing,
    validatupdatefollowing
};
