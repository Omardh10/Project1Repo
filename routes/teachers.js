const express = require('express');
const { GetTeachers, GetTeacher,GetTeacherByUserId, CreateTeacher,GetMyProfile, UpdateTeacher, DeleteTeacher, FollowTeacher } = require('../controller/TeacherController');
const router = express.Router();
const {getStudentOfTeacher} = require('../controller/EnrollmentController')
const { verifytoken } = require('../middlware/VerifyTokens');
const { get } = require('./users');
// Get All Teachers
router.get('/', GetTeachers)

router.get('/myprofile', verifytoken, GetMyProfile)

router.get('/students',verifytoken,getStudentOfTeacher)
// Get Single Teacher
router.get('/myprofile', verifytoken, GetMyProfile)
router.get('/:id', GetTeacher)


// Get Single Teacher
router.get('/user/:id', GetTeacherByUserId)

// Create New Teacher
router.post('/newteacher', CreateTeacher)


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

