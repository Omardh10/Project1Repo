const express = require('express');
const { GetCourseViewLogs, GetCourseViewLog, CreateCourseViewLog, UpdateCourseViewLog, DeleteCourseViewLog } = require('../controller/CoursViewLogController');
const router = express.Router();

// Get All CourseViewLogs
router.get('/coursesviewlogs', GetCourseViewLogs)

// Get Single CourseViewLog
router.get('/courseviewlog/:id', GetCourseViewLog)

// Create New CourseViewLog
router.post('/newcourseviewlog', CreateCourseViewLog)

// Update CourseViewLog
router.patch('/courseviewlog/:id', UpdateCourseViewLog)

// Delete CourseViewLog
router.delete('/courseviewlog/:id', DeleteCourseViewLog)




module.exports = router;

