const express = require('express');
const { GetCourses, GetCourse, CreateCourse,setvip,getFundCourses, UpdateCourse,GetMyCourses,getCoursesAtCatogaries,addCommentTolesson, DeleteCourse, PostImageCourse, PurchaseCourse, PostCourseFiles, FilterCourses, SubmitLessonQuiz, CourseForTeacher, GetChildPurchasedCourses } = require('../controller/CourseController');
const router = express.Router();
const { verifytoken, verifytokenandisAdmin } = require('../middlware/VerifyTokens');
const { CompleteLesson } = require('../controller/EnrollmentController');
const { uploadLessonFiles, uploadphoto } = require('../middlware/upload');
const { Enrollment } = require('../models/Enrollment');
const multer = require('multer');

router.get('/popular', async (req, res) => {
    try {

        const distinctCourses = await Enrollment.distinct('course_id');
        const totalCoursesCount = distinctCourses.length;

      
        if (totalCoursesCount === 0) {
            return res.status(200).json([]);
        }

        const top10PercentCount = Math.max(1, Math.ceil(totalCoursesCount * 0.2));

        const popularCourses = await Enrollment.aggregate([
            {
                $group: {
                    _id: '$course_id',
                    enrollmentCount: { $sum: 1 }
                }
            },
            {
                $sort: { enrollmentCount: -1 }
            },
            {
                $limit: top10PercentCount 
            },
            {
                $lookup: {
                    from: 'courses', 
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            {
                $unwind: '$courseDetails'
            },
            {
                $project: {
                    _id: 0,
                    courseId: '$_id',
                    enrollmentCount: 1,
                    course: '$courseDetails'
                }
            }
        ]);

        res.status(200).json({
            totalUniqueCourses: totalCoursesCount,
            top20PercentLimit: top10PercentCount,
            data: popularCourses
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message });
    }
});
router.get('/coursesforteachers', CourseForTeacher);
router.get('/search', FilterCourses);
router.get('/Mycourses', verifytoken, GetMyCourses);
// Get All Courses
router.get('/', GetCourses)
router.get('/coursesFund', verifytoken, getFundCourses)
router.get('/courseatcat/:categoryId', getCoursesAtCatogaries)
router.post('/submit-lesson-quiz', verifytoken, SubmitLessonQuiz);
router.post('/setvipcourses/:id', verifytoken, setvip)
// Get Single Course
router.get('/:id',verifytoken, GetCourse)
router.get('/child-courses/:childId', verifytoken, GetChildPurchasedCourses);
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




module.exports = router;

