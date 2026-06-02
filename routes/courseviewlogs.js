const express = require('express');
const { GetCourseViewLogs, GetCourseViewLog, CreateCourseViewLog, UpdateCourseViewLog, DeleteCourseViewLog } = require('../controller/CoursViewLogController');
const router = express.Router();

// Get All CourseViewLogs
router.get('/', GetCourseViewLogs)

// Get Single CourseViewLog
router.get('/:id', GetCourseViewLog)

// Create New CourseViewLog
router.post('/newcourseviewlog', CreateCourseViewLog)

// Update CourseViewLog
router.patch('/:id', UpdateCourseViewLog)

// Delete CourseViewLog
router.delete('/:id', DeleteCourseViewLog)




module.exports = router;

