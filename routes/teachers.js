const express = require('express');
const { GetTeachers,GetTeacherByUserId, GetMyProfile,GetTeacher, CreateTeacher, UpdateTeacher, DeleteTeacher, FollowTeacher } = require('../controller/TeacherController');
const router = express.Router();
const { verifytoken } = require('../middlware/VerifyTokens');
const { get } = require('./users');
// Get All Teachers
router.get('/', GetTeachers)

// Get Single Teacher
router.get('/myprofile', verifytoken, GetMyProfile)
router.get('/:id', GetTeacher)


// Get Single Teacher
router.get('/user/:id', GetTeacherByUserId)

// Create New Teacher
router.post('/newteacher', CreateTeacher)

// Follow Teacher
router.post('/:id/follow', FollowTeacher)

// Update Teacher
router.patch('/:id', verifytoken, UpdateTeacher)

// Delete Teacher
router.delete('/:id', verifytoken, DeleteTeacher)



module.exports = router;

