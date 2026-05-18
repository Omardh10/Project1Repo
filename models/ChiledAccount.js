const mongoose = require('mongoose');
const joi = require('joi');
const ChiledAccountSchema = new mongoose.Schema({
  
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
    age_group: {
        type: String,
        required: true
    }
}, { timestamps: true });


const ChiledAccount = mongoose.model('ChiledAccount', ChiledAccountSchema);
module.exports = ChiledAccount;
