const express = require('express');
const { GetCourseViewLogs, GetCourseViewLog, CreateCourseViewLog, UpdateCourseViewLog, DeleteCourseViewLog } = require('../controller/CoursViewLogController');
const { DeleteEnrollment, UpdateEnrollment, CreateEnrollment,GetEnrollmentsTeacher, GetEnrollment, GetEnrollments } = require('../controller/EnrollmentController');
const router = express.Router();
const { verifytoken, verifytokenandisAdmin } = require('../middlware/VerifyTokens');

// Get All Enrollments
router.get('/', verifytoken, GetEnrollments)

router.get('/teacher',verifytoken,GetEnrollmentsTeacher)

// Get Single Enrollment
router.get('/:id', GetEnrollment)

// Create New Enrollment
router.post('/newenrollment', verifytoken, CreateEnrollment)

// Update Enrollment
router.patch('/:id', verifytoken, UpdateEnrollment)

// Delete Enrollment
router.delete('/:id', verifytoken, DeleteEnrollment)




module.exports = router;

