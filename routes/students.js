const express = require('express');
const asynchandler = require("express-async-handler");

const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { GetParents, GetParent, CreateParent, UpdateParent, DeleteParent } = require('../controller/ParentController');
const { DeleteReport, UpdateReport, CreateReport, GetReport, GetReports } = require('../controller/ReportController');
const { GetReviews, GetReview, CreateReview, UpdateReview, DeleteReview } = require('../controller/ReviewController');
const { GetStudents, GetStudent, CreateStudent, UpdateStudent, DeleteStudent, GetStudentByUserId, ChargeStudentBalance } = require('../controller/StudentController');
const { verifytoken } = require('../middlware/VerifyTokens');
const {Student} =require('../models/Student')
const {Course} =require('../models/Course')
const {Enrollment} = require('../models/Enrollment')
const router = express.Router();

router.get('/mycourses', verifytoken ,async  (req, res) => {
  const student = await Student.findOne({userId: req.user.id})
  const myCourses = await Enrollment.find({student_id: student.id}).populate('course_id')
return res.status(200).json({message:"success", data: myCourses })

})

// Get All Students
router.get('/', GetStudents)

// Get Single Student
router.get('/one', verifytoken, GetStudent)

router.get('/user/:userId', GetStudentByUserId)
// Create New Student
router.post('/newstudent', CreateStudent)

router.post('/chargebalance',verifytoken, ChargeStudentBalance)



// Update Student
router.patch('/:id',verifytoken, UpdateStudent)

// Delete Student
router.delete('/:id',verifytoken, DeleteStudent)



module.exports = router;

