const asynchandler = require("express-async-handler");
const { Category, validateCreateCategory } = require("../models/Category");

const CreateCategory = asynchandler(async (req, res) => {
    const { error } = validateCreateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const categoryExists = await Category.findOne({ name: req.body.name });
    if (categoryExists) {
        return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
        name: req.body.name,
        description: req.body.description
    });

    res.status(201).json({ status: "success", category });
});

const GetCategories = asynchandler(async (req, res) => {
    const categories = await Category.find();
    res.status(200).json({ status: "success", categories });
});

const DeleteCategory = asynchandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", message: "Category deleted successfully" });
});

module.exports = {
    CreateCategory,
    GetCategories,
    DeleteCategory
};