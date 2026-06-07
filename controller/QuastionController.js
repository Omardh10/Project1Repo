const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreatequestion, validateupdatequestion } = require("../models/Quastion");


const CreateQuastion = asynchandler(async (req, res) => {
    const { error } = validatecreatequestion(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewQuestion = Question.create({
        question_text: req.body.question_text,
        options: req.body.options,
        correct_answer: req.body.correct_answer,
    })
    await NewQuestion.save();
    res.status(201).json({ status: "success", question: NewQuestion });
})


const GetQuastion = asynchandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ status: "success", question });
})

const UpdateQuastion = asynchandler(async (req, res) => {
    const { error } = validateupdatequestion(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let question = await Question.findById(req.params.id);
    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }
    if (req.user.role == 'teacher' && req.user.role == 'admin') {
        question = await Question.findByIdAndUpdate(req.params.id, {
            $set: {
                question_text: req.body.question_text,
                options: req.body.options,
                correct_answer: req.body.correct_answer,
            }
        }, { new: true });
        res.status(200).json({ status: "success", question });
    } else { return res.status(403).json({ message: "You are not authorized to update this question" }); }
})

const GetQuastions = asynchandler(async (req, res) => {
    if (req.user.role == 'teacher' || req.user.role == 'admin') {
        const questions = await Question.find();
        res.status(200).json({ status: "success", questions });
    } else {
        return res.status(403).json({ message: "You are not authorized to view questions" });
    }
})

const DeleteQuastion = asynchandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }
    if (req.user.role == 'teacher' || req.user.role == 'admin') {
        await Question.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "Question deleted successfully" });
    }
    else {
        return res.status(403).json({ message: "You are not authorized to delete this question" });
    }
})

module.exports = {
    CreateQuastion,
    GetQuastion,
    UpdateQuastion,
    GetQuastions,
    DeleteQuastion
}
