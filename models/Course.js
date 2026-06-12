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
    image: {
        url: {
            type: String,
            default: ""
        },
        publicId: {
            type: String,
            default: null
        }
    },
    founding_ratio: {
        type: Number,
        default: 0
    },
    isfounder: {
        type: Boolean,
        default: false
    },
    approval_date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });


const Course = mongoose.model('Course', CourseSchema);

const validatecreatecourse = (obj) => {
    const schema = joi.object({
        teacher_id: joi.string().required(),
        title: joi.string().required(),
        description: joi.string().required(),
        category: joi.string().required(),
        price: joi.number().required(),
        isfounder: joi.boolean(),
        founding_ratio: joi.number(),
        // lessons: joi.array().items(joi.object({
        //     title: joi.string().required(),
        //     contentType: joi.string().valid('video', 'pdf').required(),
        //     pdf_content: joi.object({
        //         url: joi.string().default(""),
        //         publicId: joi.string().default(null)
        //     }),
        //     video_content: joi.object({
        //         url: joi.string().default(""),
        //         publicId: joi.string().default(null)
        //     })
        // }))
    })
    return schema.validate(obj)
}

const validatupdatecourse = (obj) => {
    const schema = joi.object({
        teacher_id: joi.string(),
        title: joi.string(),
        description: joi.string(),
        category: joi.string(),
        price: joi.number(),
        isfounder: joi.boolean(),
        founding_ratio: joi.number(),
        // lessons: joi.array().items(joi.object({
        //     title: joi.string(),
        //     contentType: joi.string().valid('video', 'pdf'),
        //     pdf_content: joi.object({
        //         url: joi.string().default(""),
        //         publicId: joi.string().default(null)
        //     }),
        //     video_content: joi.object({
        //         url: joi.string().default(""),
        //         publicId: joi.string().default(null)
        //     })
        // }))
    })
    return schema.validate(obj)
}

module.exports = {
    Course,
    validatecreatecourse,
    validatupdatecourse
};
