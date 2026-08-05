// const mongoose = require('mongoose');
// const joi = require('joi');
// const CourseSchema = new mongoose.Schema({

//     teacher_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Teacher',
//         required: true
//     },
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Category',
//         required: true
//     },
//     price: {
//         type: Number,
//         required: true
//     },
//     lessons: [{
//         title: {
//             type: String,
//             required: true
//         },
//         about_course: {
//             type: String,
//             required: true
//         },
//         description: {
//             type: String,
//             required: true
//         },
//         contentType: {
//             type: String,
//             enum: ['video', 'pdf'],
//             required: true
//         },
//         pdf_content: {
//             url: {
//                 type: String,
//                 default: ""
//             },
//             publicId: {
//                 type: String,
//                 default: null
//             }
//         },

//         video_content: {
//             url: {
//                 type: String,
//                 required: true
//             },
//             publicId: {
//                 type: String,
//                 required: true
//             },
//               duration: { type: Number, default: 0 },
//         }
//     }],
//     status: {
//         type: String,
//         enum: ['pending', 'approved', 'rejected'],
//         default: 'pending'
//     },
//     image: {
//         url: {
//             type: String,
//             default: ""
//         },
//         publicId: {
//             type: String,
//             default: null
//         }
//     },
//     founding_ratio: {
//         type: Number,
//         default: 0
//     },
  
//     isfounder: {
//         type: Boolean,
//         default: false
//     },
//     approval_date: {
//         type: Date,
//         default: Date.now
//     }
// }, { timestamps: true });


// const Course = mongoose.model('Course', CourseSchema);

// const validatecreatecourse = (obj) => {
//     const schema = joi.object({
//         teacher_id: joi.string().required(),
//         title: joi.string().required(),
//         description: joi.string().required(),
//         category: joi.string().required(),
//         price: joi.number().required(),
//         isfounder: joi.boolean(),
//         founding_ratio: joi.number(),
//         // lessons: joi.array().items(joi.object({
//         //     title: joi.string().required(),
//         //     contentType: joi.string().valid('video', 'pdf').required(),
//         //     pdf_content: joi.object({
//         //         url: joi.string().default(""),
//         //         publicId: joi.string().default(null)
//         //     }),
//         //     video_content: joi.object({
//         //         url: joi.string().default(""),
//         //         publicId: joi.string().default(null)
//         //     })
//         // }))
//     })
//     return schema.validate(obj)
// }

// const validatupdatecourse = (obj) => {
//     const schema = joi.object({
//         teacher_id: joi.string(),
//         title: joi.string(),
//         description: joi.string(),
//         category: joi.string(),
//         price: joi.number(),
//         isfounder: joi.boolean(),
//         founding_ratio: joi.number(),
//         // lessons: joi.array().items(joi.object({
//         //     title: joi.string(),
//         //     contentType: joi.string().valid('video', 'pdf'),
//         //     pdf_content: joi.object({
//         //         url: joi.string().default(""),
//         //         publicId: joi.string().default(null)
//         //     }),
//         //     video_content: joi.object({
//         //         url: joi.string().default(""),
//         //         publicId: joi.string().default(null)
//         //     })
//         // }))
//     })
//     return schema.validate(obj)
// }

// module.exports = {
//     Course,
//     validatecreatecourse,
//     validatupdatecourse
// };



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
      duration: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    // ⏱️ إجمالي مدة الكورس (تحسب تلقائياً للدروس من نوع فيديو فقط)
    duration: {
        type: Number,
        default: 0
    },
    lessons: [{
        hasquiz: {
            type: Boolean,
            default: false
        },
        quiz: {
            title: {
                type: String,
                default: ""
            },
            questions: [{
                question_text: {
                    type: String,
                    required: true,
                },
                options: {
                    type: [String],
                    required: true,
                },
                correct_answer: {
                    type: String,
                    required: true,
                }
            }]
        },
        title: {
            type: String,
            required: true
        },
        about_course: {
            type: String,
            required: true
        },
        description: {
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
                default: null 
            },
            publicId: {
                type: String,
                required: true
            },
               duration: { 
                type: Number, 
                default: 0 
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

CourseSchema.pre('save', function() {
    if (this.lessons && this.lessons.length > 0) {
        this.duration = this.lessons.reduce((total, lesson) => {
            if (lesson.contentType === 'video' && lesson.video_content?.duration) {
                return total + lesson.video_content.duration;
            }
            return total;
        }, 0);
    } else {
        this.duration = 0;
    }
});

const Course = mongoose.model('Course', CourseSchema);

const validatecreatecourse = (obj) => {
    const schema = joi.object({
        teacher_id: joi.string(),
        title: joi.string().required(),
        description: joi.string().required(),
        category: joi.string().required(),
        price: joi.number().required(),
        about_course: joi.string().required(),
        isfounder: joi.boolean(),
        founding_ratio: joi.number()
    });
    return schema.validate(obj);
};

const validatupdatecourse = (obj) => {
    const schema = joi.object({
        teacher_id: joi.string(),
        title: joi.string(),
        description: joi.string(),
        about_course: joi.string(),
        category: joi.string(),
        price: joi.number(),
        isfounder: joi.boolean(),
        founding_ratio: joi.number(),
        lessons: joi.array()
    })
    return schema.validate(obj)
}

module.exports = {
    Course,
    validatecreatecourse,
    validatupdatecourse
};