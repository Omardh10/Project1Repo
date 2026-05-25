const express = require('express');
const { GetCourses, GetCourse, CreateCourse, UpdateCourse, DeleteCourse } = require('../controller/CourseController');
const router = express.Router();

// Get All Courses
router.get('/courses', GetCourses)

// Get Single Course
router.get('/course/:id', GetCourse)

// Create New Course
router.post('/newcourse', CreateCourse)

// Update Course
router.patch('/course/:id', UpdateCourse)

// Delete Course
router.delete('/course/:id', DeleteCourse)




module.exports = router;

