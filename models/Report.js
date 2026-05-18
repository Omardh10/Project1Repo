const mongoose = require('mongoose');
const joi = require('joi');
const reportSchema = new mongoose.Schema({
  
    student_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },

    parent_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent', 
        required: true 
    },
    report_data: {
        type: String,
        required: true
    }
}, { timestamps: true });



const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
