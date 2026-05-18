const mongoose = require('mongoose');
const joi = require('joi');
const TeacherSchema = new mongoose.Schema({
      userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        total_students:{
            type:Number,
            required:true
        },
        total_courses:{
            type:Number,
            required:true
        }
},{timestamps:true});
const Teacher = mongoose.model('Teacher', TeacherSchema);
module.exports = {
    Teacher
};