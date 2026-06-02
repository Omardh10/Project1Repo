const express = require('express');
const { GetTeachers, GetTeacher, CreateTeacher, UpdateTeacher, DeleteTeacher, FollowTeacher } = require('../controller/TeacherController');
const router = express.Router();
const { verifytoken } = require('../middlware/VerifyTokens');
// Get All Teachers
router.get('/', GetTeachers)

// Get Single Teacher
router.get('/:id', GetTeacher)

// Create New Teacher
router.post('/newteacher', CreateTeacher)

// Follow Teacher
router.post('/:id/follow', verifytoken, FollowTeacher)

// Update Teacher
router.patch('/:id', verifytoken, UpdateTeacher)

// Delete Teacher
router.delete('/:id', verifytoken, DeleteTeacher)



module.exports = router;

