const mongoose = require('mongoose');
const joi = require('joi');
const StudentSchema = new mongoose.Schema({
      userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        points_balance:{
            type:Number,
            required:true
        },
        enrolled_courses_count:{
            type:Number,
            required:true
        }
},{timestamps:true});
const Student = mongoose.model('Student', StudentSchema);
module.exports = {
    Student
};