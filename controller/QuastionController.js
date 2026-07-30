const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreatequestion, validateupdatequestion } = require("../models/Quastion");


const CreateQuestion = asynchandler(async (req, res) => {
    const { error } = validatecreatequestion(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const NewQuestion = await Question.create({
        exam_id: req.body.exam_id,
        question_text: req.body.question_text,
        options: req.body.options,
        correct_answer: req.body.correct_answer,
    });
    res.status(201).json({ status: "success", question: NewQuestion });
});

const GetQuestion = asynchandler(async (req, res) => {
    const question = await Question.findById(req.params.id).populate('exam_id');
    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ status: "success", question });
});

const UpdateQuestion = asynchandler(async (req, res) => {
    const { error } = validateupdatequestion(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    let question = await Question.findById(req.params.id);
    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }
    
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
        question = await Question.findByIdAndUpdate(req.params.id, {
            $set: {
                exam_id: req.body.exam_id,
                question_text: req.body.question_text,
                options: req.body.options,
                correct_answer: req.body.correct_answer,
            }
        }, { new: true });
        res.status(200).json({ status: "success", question });
    } else { 
        return res.status(403).json({ message: "You are not authorized to update this question" }); 
    }
});

const GetQuestions = asynchandler(async (req, res) => {

    const questions = await Question.find(); 
    res.status(200).json({ status: "success", questions });
});

const DeleteQuestion = asynchandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
        await Question.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "Question deleted successfully" });
    } else {
        return res.status(403).json({ message: "You are not authorized to delete this question" });
    }
});

module.exports = {
    CreateQuestion,
    GetQuestion,
    UpdateQuestion,
    GetQuestions,
    DeleteQuestion
}
