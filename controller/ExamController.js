const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validateupdateexam, validatecreateexam, Exam } = require("../models/Exam");
const { Question } = require("../models/Quastion");
const { StudentAnswer } = require("../models/StudentAnswer");


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
    const exam = await Exam.findById(req.params.id).populate('course_id');
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
    let exam = await Exam.findById(req.params.id).populate('course_id');
    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }
    if (req.user.role == 'teacher' || req.user.role == 'admin') {
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

const SubmitExam = asynchandler(async (req, res) => {
    const { exam_id, answers } = req.body; 

    const student_id = req.user.id || req.user._id;
    const exam = await Exam.findById(exam_id);
    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }
    const questions = await Question.find({ exam_id });
    if (questions.length === 0) {
        return res.status(400).json({ message: "No questions found for this exam" });
    }

    let correctCount = 0;
    for (const item of answers) {
        const question = questions.find(q => q._id.toString() === item.question_id);

        if (question) {
            const isCorrect = (question.correct_answer === item.selected_option);
            
            if (isCorrect) {
                correctCount++;
            }
            await StudentAnswer.create({
                student_id: student_id,
                question_id: item.question_id,
                selected_option: item.selected_option,
                is_correct: isCorrect
            });
        }
    }

    const totalQuestions = questions.length;
    const scorePercentage = (correctCount / totalQuestions) * 100;
 
    const isPassed = scorePercentage >= exam.passing_score;

    res.status(200).json({
        status: "success",
        result: {
            totalQuestions,
            correctAnswers: correctCount,
            scorePercentage: Math.round(scorePercentage),
            passingScore: exam.passing_score,
            isPassed,
            message: isPassed 
                ? "مبروك! لقد اجتزت الاختبار بنجاح 🎉" 
                : "للأسف، لم تتجاوز نسبة النجاح المطلوبة 💔"
        }
    });
});

module.exports = {
    CreateExam,
    GetExam,
    UpdateExam,
    GetExams,
    DeleteExam,
    SubmitExam
}
