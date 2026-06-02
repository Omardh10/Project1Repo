const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { verifytoken } = require('../middlware/VerifyTokens');
const router = express.Router();

// Get All Exams
router.get('/', verifytoken, GetExams)

// Get Single Exam
router.get('/:id', GetExam)

// Create New Exam
router.post('/newexam', verifytoken, CreateExam)

// Update Exam
router.patch('/:id', verifytoken, UpdateExam)

// Delete Exam
router.delete('/:id', verifytoken, DeleteExam)




module.exports = router;

