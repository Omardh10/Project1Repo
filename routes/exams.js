const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam,postDegree,GetExamWithCourseId, DeleteExam, SubmitExam } = require('../controller/ExamController');
const { verifytoken } = require('../middlware/VerifyTokens');
const router = express.Router();

// Get All Exams
router.get('/', verifytoken, GetExams)

// Get Single Exam
router.get('/:id', GetExam)

// Get Exam with Course Id
router.get('/course/:course_id', GetExamWithCourseId)

router.post('/submit_exam', verifytoken, postDegree)

// Create New Exam
router.post('/newexam', verifytoken, CreateExam)

// Update Exam
router.patch('/:id', verifytoken, UpdateExam)

// Delete Exam
router.delete('/:id', verifytoken, DeleteExam)

router.post('/submit', verifytoken, SubmitExam)


module.exports = router;

