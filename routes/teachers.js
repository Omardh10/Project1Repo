const express = require('express');
const { GetTeachers, GetTeacher,GetTeacherByUserId,getStudentDetailsForTeacher,createquiz,GetTeachersPercentage ,CreateTeacher,GetMyProfile, UpdateTeacher, DeleteTeacher, FollowTeacher } = require('../controller/TeacherController');
const router = express.Router();
const {getStudentOfTeacher} = require('../controller/EnrollmentController')
const { verifytoken } = require('../middlware/VerifyTokens');
const { get } = require('./users');
const {User} = require('../models/User');
const {Teacher} = require('../models/Teacher');
// Get All Teachers
router.get('/', GetTeachers)
router.get('/checkStatus', async (req, res) => {
    const user = await User.find({email: req.body.email});
    const teacher = await Teacher.findOne({ userId: user[0].id });
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ status: teacher.stetus });
})
router.get('/adminPercentages',verifytoken,GetTeachersPercentage)
router.get('/myprofile', verifytoken, GetMyProfile)
router.post('/quiz/:id', verifytoken, createquiz)
router.get('/students',verifytoken,getStudentOfTeacher)
// Get Single Teacher
router.get('/myprofile', verifytoken, GetMyProfile)
router.get('/:id', GetTeacher)

router.get('/students/:userId',verifytoken, getStudentDetailsForTeacher);

// Create New Teacher
router.post('/newteacher',verifytoken, CreateTeacher)


// Get Single Teacher



// Get Single Teacher
router.get('/user/:id', GetTeacherByUserId)

// Follow Teacher
router.post('/:id/follow', FollowTeacher)

// Update Teacher
router.patch('/:id', verifytoken, UpdateTeacher)

// Delete Teacher
router.delete('/:id', verifytoken, DeleteTeacher)



module.exports = router;

