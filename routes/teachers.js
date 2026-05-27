const express = require('express');
const { GetTeachers, GetTeacher, CreateTeacher, UpdateTeacher, DeleteTeacher } = require('../controller/TeacherController');
const router = express.Router();

// Get All Teachers
router.get('/teachers', GetTeachers)

// Get Single Teacher
router.get('/teacher/:id', GetTeacher)

// Create New Teacher
router.post('/newteacher', CreateTeacher)

// Update Teacher
router.patch('/teacher/:id', UpdateTeacher)

// Delete Teacher
router.delete('/teacher/:id', DeleteTeacher)



module.exports = router;

