const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');


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
    const { error } = validatupdateexam(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let exam = await Exam.findById(req.params.id);
    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }
    exam = await Exam.findByIdAndUpdate(req.params.id, {
        $set: {
            course_id: req.body.course_id,
            title: req.body.title,
            passing_score: req.body.passing_score,
        }
    }, { new: true });
    res.status(200).json({ status: "success", exam });
})

const GetExams = asynchandler(async (req, res) => {
    const exams = await Exam.find();
    res.status(200).json({ status: "success", exams });
})

const DeleteExam = asynchandler(async (req, res) => {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json({ status: "success", message: "Exam deleted" });
})

module.exports = {
    CreateExam,
    GetExam,
    UpdateExam,
    GetExams,
    DeleteExam
}
