const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validateupdateexam, validatecreateexam } = require("../models/Exam");


const CreateExam = asynchandler(async (req, res) => {
    const { error } = validatecreateexam(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewExam = Exam.create({
        course_id: req.body.course_id,
        title: req.body.title,
        passing_score: req.body.passing_score,
    })
    await NewExam.save();
    res.status(201).json({ status: "success", exam: NewExam });
})


const GetExam = asynchandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json({ status: "success", exam });
})

const UpdateExam = asynchandler(async (req, res) => {
    const { error } = validateupdateexam(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let exam = await Exam.findById(req.params.id);
    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }
    if (req.user.role == 'teacher' && req.user.role == 'admin') {
        exam = await Exam.findByIdAndUpdate(req.params.id, {
            $set: {
                course_id: req.body.course_id,
                title: req.body.title,
                passing_score: req.body.passing_score,
            }
        }, { new: true });
        res.status(200).json({ status: "success", exam });
    } else { return res.status(403).json({ message: "You are not authorized to update this exam" }); }
})

const GetExams = asynchandler(async (req, res) => {
    if (req.user.role == 'teacher' || req.user.role == 'admin') {
        const exams = await Exam.find();
        res.status(200).json({ status: "success", exams });
    } else {
        return res.status(403).json({ message: "You are not authorized to view exams" });
    }
})

const DeleteExam = asynchandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }
    if (req.user.role == 'teacher' || req.user.role == 'admin') {
        await Exam.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "Exam deleted successfully" });
    }
    else {
        return res.status(403).json({ message: "You are not authorized to delete this exam" });
    }
})

module.exports = {
    CreateExam,
    GetExam,
    UpdateExam,
    GetExams,
    DeleteExam
}
