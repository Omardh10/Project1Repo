const express = require('express');
const { GetCourses, GetCourse, CreateCourse, UpdateCourse,GetMyCourses,addCommentTolesson, DeleteCourse, PostImageCourse, PurchaseCourse, PostCourseFiles, FilterCourses } = require('../controller/CourseController');
const router = express.Router();
const { verifytoken, verifytokenandisAdmin } = require('../middlware/VerifyTokens');
const { CompleteLesson } = require('../controller/EnrollmentController');
const { uploadLessonFiles, uploadphoto } = require('../middlware/upload');
const multer = require('multer');

router.get('/Mycourses', verifytoken, GetMyCourses);
// Get All Courses
router.get('/', GetCourses)

// Get Single Course
router.get('/:id', GetCourse)

// Create New Course
router.post('/newcourse', verifytoken, CreateCourse)

// Upload Course Image
router.post('/course/image/:id', verifytoken, uploadphoto.single('image'), PostImageCourse);

router.post('/addcomment/:courseId/:lessonId', verifytoken, addCommentTolesson);

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

