const express = require('express');
const { GetCourses, GetCourse, CreateCourse, UpdateCourse, DeleteCourse } = require('../controller/CourseController');
const router = express.Router();
const { verifytoken, verifytokenandisAdmin } = require('../middlware/VerifyTokens');

// Get All Courses
router.get('/', GetCourses)

// Get Single Course
router.get('/:id', GetCourse)

// Create New Course
router.post('/newcourse', verifytoken, CreateCourse)

// Update Course
router.patch('/:id', verifytoken, UpdateCourse)

// Delete Course
router.delete('/:id', verifytoken, DeleteCourse)




module.exports = router;

