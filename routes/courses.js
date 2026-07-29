const express = require('express');
const { GetCourses, GetCourse, CreateCourse, UpdateCourse, DeleteCourse, PostImageCourse, PurchaseCourse, PostCourseFiles, FilterCourses } = require('../controller/CourseController');
const router = express.Router();
const { verifytoken, verifytokenandisAdmin } = require('../middlware/VerifyTokens');
const { CompleteLesson } = require('../controller/EnrollmentController');
const { uploadLessonFiles, uploadphoto } = require('../middlware/upload');

// Get All Courses
router.get('/', GetCourses)

// Get Single Course
router.get('/:id', GetCourse)

// Create New Course
router.post('/newcourse', verifytoken, CreateCourse)

// Upload Course Image
router.post('/newcourseimage/:id',uploadphoto.single('image'), verifytoken, PostImageCourse)

router.post(
    '/add-lesson/:id',
    verifytoken,
    uploadLessonFiles.fields([
        { name: 'video', maxCount: 1 },
        { name: 'pdf', maxCount: 1 }   
    ]),
    PostCourseFiles
);

// Update Course
router.patch('/:id', verifytoken, UpdateCourse)

// Delete Course
router.delete('/:id', verifytoken, DeleteCourse)

// purchase Course
router.post('/purchasecourse/:courseId', verifytoken, PurchaseCourse)

// complete lesson
router.patch('/complete-lesson', verifytoken, CompleteLesson);

// search course
router.get('/search', FilterCourses);


module.exports = router;

