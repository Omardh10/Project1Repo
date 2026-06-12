const express = require('express');
const { GetCourses, GetCourse, CreateCourse, UpdateCourse, DeleteCourse, PostImageCourse } = require('../controller/CourseController');
const router = express.Router();
const { verifytoken, verifytokenandisAdmin } = require('../middlware/VerifyTokens');

// Get All Courses
router.get('/', GetCourses)

// Get Single Course
router.get('/:id', GetCourse)

// Create New Course
router.post('/newcourse', verifytoken, CreateCourse)

// Upload Course Image
router.post('/newcourseimage', verifytoken, PostImageCourse)

// Update Course
router.patch('/:id', verifytoken, UpdateCourse)

// Delete Course
router.delete('/:id', verifytoken, DeleteCourse)




module.exports = router;

