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

const Following = mongoose.model('Following', followingSchema);
module.exports = Following;
