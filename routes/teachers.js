const express = require('express');
const { GetTeachers, GetTeacher,GetTeacherByUserId, CreateTeacher,GetMyProfile, UpdateTeacher, DeleteTeacher, FollowTeacher } = require('../controller/TeacherController');
const router = express.Router();
const { verifytoken } = require('../middlware/VerifyTokens');
// Get All Teachers
router.get('/', GetTeachers)

// Get Single Teacher
router.get('/:id', GetTeacher)

// Create New Teacher
router.post('/newteacher', CreateTeacher)


// Get Single Teacher
router.get('/myprofile', verifytoken, GetMyProfile)


// Get Single Teacher
router.get('/user/:id', GetTeacherByUserId)

// Follow Teacher
router.post('/:id/follow', FollowTeacher)

// Update Teacher
router.patch('/:id', verifytoken, UpdateTeacher)

// Delete Teacher
router.delete('/:id', verifytoken, DeleteTeacher)



module.exports = router;

