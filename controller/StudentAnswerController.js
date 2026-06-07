const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');


const CreateStudentAnswer = asynchandler(async (req, res) => {
    const { error } = validatecreatestudentanswer(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewStudentAnswer = StudentAnswer.create({
        student_id: req.body.student_id,
        question_id: req.body.question_id,
        answer: req.body.answer,
    })
    await NewStudentAnswer.save();
    res.status(201).json({ status: "success", studentAnswer: NewStudentAnswer });
})


const GetStudentAnswer = asynchandler(async (req, res) => {
    const studentAnswer = await StudentAnswer.findById(req.params.id);
    if (!studentAnswer) {
        return res.status(404).json({ message: "Student answer not found" });
    }
    res.status(200).json({ status: "success", studentAnswer });
})

const UpdateStudentAnswer = asynchandler(async (req, res) => {
    const { error } = validateupdatestudentanswer(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let studentAnswer = await StudentAnswer.findById(req.params.id);
    if (!studentAnswer) {
        return res.status(404).json({ message: "Student answer not found" });
    }
    if (req.user.role == 'teacher' && req.user.role == 'admin') {
        studentAnswer = await StudentAnswer.findByIdAndUpdate(req.params.id, {
            $set: {
                student_id: req.body.student_id,
                question_id: req.body.question_id,
                answer: req.body.answer,
                is_correct: req.body.is_correct
            }
        }, { new: true });
        res.status(200).json({ status: "success", studentAnswer });
    } else { return res.status(403).json({ message: "You are not authorized to update this question" }); }
})

const GetStudentAnswers = asynchandler(async (req, res) => {
    if (req.user.role == 'teacher' || req.user.role == 'admin') {
        const studentAnswers = await StudentAnswer.find();
        res.status(200).json({ status: "success", studentAnswers });
    } else {
        return res.status(403).json({ message: "You are not authorized to view student answers" });
    }
})

const DeleteStudentAnswer = asynchandler(async (req, res) => {
    const studentAnswer = await StudentAnswer.findById(req.params.id);
    if (!studentAnswer) {
        return res.status(404).json({ message: "Student answer not found" });
    }
    if (req.user.role == 'teacher' || req.user.role == 'admin') {
        await StudentAnswer.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "Student answer deleted successfully" });
    }
    else {
        return res.status(403).json({ message: "You are not authorized to delete this student answer" });
    }
})

module.exports = {
    CreateStudentAnswer,
    GetStudentAnswer,
    UpdateStudentAnswer,
    GetStudentAnswers,
    DeleteStudentAnswer
}
