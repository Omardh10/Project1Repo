const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const router = express.Router();

// Get All Exams
router.get('/exams', GetExams)

// Get Single Exam
router.get('/exam/:id', GetExam)

// Create New Exam
router.post('/newexam', CreateExam)

// Update Exam
router.patch('/exam/:id', UpdateExam)

// Delete Exam
router.delete('/exam/:id', DeleteExam)




module.exports = router;

