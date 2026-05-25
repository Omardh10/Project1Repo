const express = require('express');
const { GetCourseViewLogs, GetCourseViewLog, CreateCourseViewLog, UpdateCourseViewLog, DeleteCourseViewLog } = require('../controller/CoursViewLogController');
const { DeleteEnrollment, UpdateEnrollment, CreateEnrollment, GetEnrollment, GetEnrollments } = require('../controller/EnrollmentController');
const router = express.Router();

// Get All Enrollments
router.get('/enrollments', GetEnrollments)

// Get Single Enrollment
router.get('/enrollment/:id', GetEnrollment)

// Create New Enrollment
router.post('/newenrollment', CreateEnrollment)

// Update Enrollment
router.patch('/enrollment/:id', UpdateEnrollment)

// Delete Enrollment
router.delete('/enrollment/:id', DeleteEnrollment)




module.exports = router;

