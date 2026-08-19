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
const {SendNotification} = require('../socket/socket')
const router = express.Router();

router.get('/mycourses', verifytoken ,  asynchandler(async (req, res) => {
  const student = await Student.findOne({userId: req.user.id})
  if(!student){
    return res.status(404).json({message: "student not found"})
  }
  const myCourses = await Enrollment.find({student_id: student.id})
res.status(200).json({message:"success", data: myCourses })

}))

router.post('/quiz-confirm', verifytoken, async(req,res)=>{
   const {boolQuiz} = req.body
  if(boolQuiz==false){
     return res.status(200).json({message:"wrong answere "})
  }
  const student = await Student.findOne({userId: req.user.id});
  
  student.points_balance+=3
  await student.save()
          await SendNotification(req.user.id, "مبروك! حصلت على 3 نقاط   لاجابتك على السؤال بشكل صحيح 🌟", {  });
  
  return res.status(200).json({message:"very good, your answere is right"})



} )

// Get All Students
router.get('/', GetStudents)

// Get Single Student
router.get('/one', verifytoken, GetStudent)

router.get('/myprofile', verifytoken, async (req,res)=>{
 const student = await Student.findOne({userId: req.user.id})
 if(!student){
  return res.status(403).json({message: "student not found"})
 }
 return res.status(200).json({messgae: "success", student: student})
})

router.get('/user/:userId', GetStudentByUserId)
// Create New Student
router.post('/newstudent', CreateStudent)

router.post("/amar",async (req,res)=>{
  
const lona = await Student.findOne({userId:"6a819d3fd1e90977e37742a5"});
lona.points_balance = 500;
await lona.save();
return res.json({message:"success"});
})

router.post('/chargebalance',verifytoken, ChargeStudentBalance)



// Update Student
router.patch('/:id',verifytoken, UpdateStudent)

// Delete Student
router.delete('/:id',verifytoken, DeleteStudent)



module.exports = router;

