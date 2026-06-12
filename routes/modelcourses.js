const express = require('express');
const { verifytoken } = require('../middlware/VerifyTokens');
const { GetModelCourses, GetModelCourse, CreateModelCourse, UpdateModelCourse, DeleteModelCourse } = require('../controller/ModelCourseController');
const router = express.Router();

// Get All modelcourses
router.get('/', GetModelCourses)

// Get Single modelcourse
router.get('/:id', GetModelCourse)

// Create New modelcourse
router.post('/newmodelcourse', CreateModelCourse)
// Update modelcourse
router.patch('/:id',verifytoken, UpdateModelCourse)

// Delete modelcourse
router.delete('/:id',verifytoken, DeleteModelCourse)



module.exports = router;

