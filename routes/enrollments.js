const express = require('express');
const { GetCourseViewLogs, GetCourseViewLog, CreateCourseViewLog, UpdateCourseViewLog, DeleteCourseViewLog } = require('../controller/CoursViewLogController');
const { DeleteEnrollment, UpdateEnrollment, CreateEnrollment, GetEnrollment, GetEnrollments } = require('../controller/EnrollmentController');
const router = express.Router();
const { verifytoken, verifytokenandisAdmin } = require('../middlware/VerifyTokens');

// Get All Enrollments
router.get('/', verifytokenandisAdmin,GetEnrollments)

// Get Single Enrollment
router.get('/:id', GetEnrollment)

// Create New Enrollment
router.post('/newenrollment', verifytokenandisAdmin,CreateEnrollment)

// Update Enrollment
router.patch('/:id', verifytokenandisAdmin, UpdateEnrollment)

// Delete Enrollment
router.delete('/:id',verifytokenandisAdmin, DeleteEnrollment)




module.exports = router;

