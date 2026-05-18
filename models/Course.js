const mongoose = require('mongoose');
const joi = require('joi');
const CourseSchema = new mongoose.Schema({

    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    lessons: [{
        title: {
            type: String,
            required: true
        },
        contentType: {
            type: String,
            enum: ['video', 'pdf'],
            required: true
        },

        pdf_content: {
            url: {
                type: String,
                default: ""
            },
            publicId: {
                type: String,
                default: null
            }
        },

        video_content: {
            url: {
                type: String,
                default: ""
            },
            publicId: {
                type: String,
                default: null
            }
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approval_date: {
        type: Date,
        required: true
    }
}, { timestamps: true });


const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;
