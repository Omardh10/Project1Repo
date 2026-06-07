const express = require('express');
const { verifytoken } = require('../middlware/VerifyTokens');
const { GetStudentAnswers, GetStudentAnswer, DeleteStudentAnswer, UpdateStudentAnswer, CreateStudentAnswer } = require('../controller/StudentAnswerController');
const router = express.Router();

// Get All Student Answers
router.get('/', verifytoken, GetStudentAnswers)

// Get Single Student Answer
router.get('/:id', GetStudentAnswer)

// Create New Student Answer
router.post('/newstudentanswer', verifytoken, CreateStudentAnswer)

// Update Student Answer
router.patch('/:id', verifytoken, UpdateStudentAnswer)

// Delete Student Answer
router.delete('/:id', verifytoken, DeleteStudentAnswer)




module.exports = router;

