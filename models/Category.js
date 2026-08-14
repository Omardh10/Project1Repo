const mongoose = require('mongoose');
const Joi = require('joi');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: Object,
        default: {
            url: "",
            publicId: null
        },
        required: true
    }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

function validateCreateCategory(obj) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional()
    });
    return schema.validate(obj);
}

module.exports = {
    Category,
    validateCreateCategory
};