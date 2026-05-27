const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { GetParents, GetParent, CreateParent, UpdateParent, DeleteParent } = require('../controller/ParentController');
const { DeleteReport, UpdateReport, CreateReport, GetReport, GetReports } = require('../controller/ReportController');
const { GetReviews, GetReview, CreateReview, UpdateReview, DeleteReview } = require('../controller/ReviewController');
const { GetStudents, GetStudent, CreateStudent, UpdateStudent, DeleteStudent } = require('../controller/StudentController');
const router = express.Router();

// Get All Students
router.get('/students', GetStudents)

// Get Single Student
router.get('/student/:id', GetStudent)

// Create New Student
router.post('/newstudent', CreateStudent)

// Update Student
router.patch('/student/:id', UpdateStudent)

// Delete Student
router.delete('/student/:id', DeleteStudent)



module.exports = router;

