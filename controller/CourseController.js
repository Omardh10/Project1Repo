const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatupdatecourse, Course, validatecreatecourse } = require("../models/Course");
const { UploadFile, RemoveImage } = require("../utils/cloudinary"); // تأكد من استيراد RemoveImage
const { Enrollment } = require("../models/Enrollment");
const { Transaction } = require("../models/Transaction");
const { Student } = require('../models/Student')
const { Admin } = require('../models/Admin')
const {Discount} =  require('../models/Discount')
const { validatecreateteacher, validateupdateteacher, Teacher } = require("../models/Teacher");

const CreateCourse = asynchandler(async (req, res) => {

    const { teacher_id, title, description, category, price, lessons } = req.body
    const { error } = validatecreatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const admin = await Admin.find();

    const NewCourse = await Course.create({
        teacher_id,
        userId: req.user.id,
        title,
        description,
        category,
        adminPercentage: admin[0].platform_fee_precentage,
        price
    })

    res.status(201).json({ status: "success", course: NewCourse });
})

const PostCourseFiles = asynchandler(async (req, res) => {
    const videoFile = req.files?.['video']?.[0];
    const pdfFile = req.files?.['pdf']?.[0];

    if (!videoFile) {
        return res.status(400).json({ message: "يرجى اختيار مقطع الفيديو للدرس" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
        if (videoFile && fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
        if (pdfFile && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
        return res.status(404).json({ message: "الدورة غير موجودة" });
    }

    let videoResult = null;
    let pdfResult = null;

    try {
        // 1. رفع مقطع الفيديو إلى Cloudinary
        videoResult = await UploadFile(videoFile.path, 'video');
        if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);

        // 2. رفع ملف الـ PDF إن وجد
        if (pdfFile) {
            pdfResult = await UploadFile(pdfFile.path, 'raw');
            if (fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
        }

        // استخراج القيم بأمان من استجابة Cloudinary
        const videoUrl = videoResult?.secure_url || videoResult?.url;
        const videoPublicId = videoResult?.public_id || videoResult?.publicId;
        // قراءة المدة بالثواني من استجابة Cloudinary
        const videoDuration = videoResult?.duration || 0;

        if (!videoUrl || !videoPublicId) {
            throw new Error("فشل الحصول على رابط الفيديو أو publicId من Cloudinary");
        }

        // 3. بناء كائن الدرس مع الحقول المطلوبة في الـ Schema
        const newLesson = {
            title: req.body.title || "درس جديد",
            description: req.body.description || req.body.title || "وصف الدرس",
            about_course: req.body.about_course || "عن الدرس",
            contentType: req.body.contentType || 'video',
            video_content: {
                url: videoUrl,
                publicId: videoPublicId,
                duration: videoDuration // ⏱️ تمرير مدة الفيديو هنا
            },
            pdf_content: pdfResult ? {
                url: pdfResult.secure_url || pdfResult.url,
                publicId: pdfResult.public_id || pdfResult.publicId
            } : undefined
        };

        // 4. حفظ الدرس في قاعدة البيانات
        // عند استدعاء course.save()، سيعمل الـ pre('save') hook تلقائياً
        // ليحسب مجموع أوقات كل الدروس ويخزنه في course.duration
        course.lessons.push(newLesson);
        await course.save();

        return res.status(201).json({
            message: "تم رفع الدرس وملحقاته بنجاح",
            lesson: newLesson,
            totalCourseDuration: course.duration // إرجاع إجمالي المدة الجديدة للمستند في الاستجابة
        });

    } catch (error) {
        console.error("DETAILS_OF_UPLOAD_ERROR:", error);

        // تنظيف الملفات المؤقتة عند حدوث خطأ
        if (videoFile && fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
        if (pdfFile && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);

        return res.status(500).json({
            message: "حدث خطأ أثناء معالجة ورفع الملفات",
            errorDetails: error.message || error
        });
    }
});

const getCoursesAtCatogaries = asynchandler(async (req, res) => {
    const { category } = req.query;

    if (!category) {
        return res.status(400).json({ message: "يرجى تحديد الفئة في الاستعلام" });
    }

    try {
        const courses = await Course.find({ category }).populate('teacher_id').populate('category');
        if (courses.length === 0) {
            return res.status(404).json({ message: "لا توجد دورات في هذه الفئة" });
        }
        res.status(200).json({ status: "success", courses });
    } catch (error) {
        console.error("ERROR_FETCHING_COURSES_BY_CATEGORY:", error);
        res.status(500).json({ message: "حدث خطأ أثناء جلب الدورات", errorDetails: error.message || error });
    }
});

// 3. Get Course Details (Lock/Unlock logic)
// const GetCourse = asynchandler(async (req, res) => {
//     const course = await Course.findById(req.params.id).populate('teacher_id');
//     if (!course) {
//         return res.status(404).json({ message: "course not found" });
//     }

//     let isAuthorized = false;
//     let userId = null;
//     let userRole = null;
//     const authtoken = req.headers.authorization;

//     if (authtoken) {
//         const token = authtoken.split(" ")[1];
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_KEY);
//             userId = decoded.id || decoded._id; 
//             userRole = decoded.role;
//         } catch (error) {}
//     }

//     if (userId) {
//         const isAdmin = userRole === 'admin';
//         const isOwner = course.teacher_id && course.teacher_id._id && 
//                         course.teacher_id._id.toString() === userId.toString();

//         if (isAdmin || isOwner) {
//             isAuthorized = true; 
//         } else {
//             const enrollment = await Enrollment.findOne({ student_id: userId, course_id: course._id });
//             if (enrollment) {
//                 isAuthorized = true;
//             }
//         }
//     }

//     let courseToSend = course.toObject();
//     if (!isAuthorized) {
//         if (courseToSend.lessons && courseToSend.lessons.length > 0) {
//             courseToSend.lessons = courseToSend.lessons.map(lesson => {
//                 return {
//                     _id: lesson._id,
//                     title: lesson.title,
//                     description: lesson.description,
//                     contentType: lesson.contentType, 
//                     video_content: {
//                         url: "LOCKED",
//                         publicId: null
//                     },
//                     pdf_content: lesson.pdf_content ? {
//                         url: "LOCKED",
//                         publicId: null
//                     } : undefined
//                 };
//             });
//         }
//     }

//     res.status(200).json({ 
//         status: "success", 
//         isPurchased: isAuthorized, 
//         course: courseToSend 
//     });
// });
// 3. Get Course Details (Lock/Unlock logic)
const GetCourse = asynchandler(async (req, res) => {

    const course = await Course.findById(req.params.id).populate('category').populate('userId');;
    if (!course) {
        return res.status(404).json({ message: "course not found" })
    }

    let isAuthorized = false;
    let userId = null;
    let userRole = null;
    const authtoken = req.headers.authorization;

    if (authtoken) {
        const token = authtoken.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            userId = decoded.id || decoded._id;
            userRole = decoded.role;
        } catch (error) {
            console.error("JWT Verification error:", error.message);
        }
    }

    if (userId) {
        const isAdmin = userRole === 'admin';

        const teacherUserId = course.teacher_id?.userId || course.teacher_id?._id;
        const isOwner = teacherUserId && teacherUserId.toString() === userId.toString();

        if (isAdmin || isOwner) {
            isAuthorized = true;
        } else {
            const enrollment = await Enrollment.findOne({ userId: req.user.id, course_id: course._id });
            console.log(req.user.id, String(course._id))
            if (enrollment) {
                isAuthorized = true;
            }
        }
    }

    let courseToSend = course.toObject();

    // إخفاء الروابط فقط إذا لم يكن مستخدم موثق أو صاحب كورس أو مشترك
    if (!isAuthorized) {
        if (courseToSend.lessons && courseToSend.lessons.length > 0) {
            courseToSend.lessons = courseToSend.lessons.map(lesson => {
                return {
                    _id: lesson._id,
                    title: lesson.title,
                    hasquiz: lesson.hasquiz,
                    quiz: lesson.quiz,
                    description: lesson.description,
                    contentType: lesson.contentType,
                    video_content: {
                        url: "LOCKED",
                        publicId: null
                    },
                    pdf_content: lesson.pdf_content ? {
                        url: "LOCKED",
                        publicId: null
                    } : undefined
                };
            });
        }
    }

    res.status(200).json({
        status: "success",
        isPurchased: isAuthorized,
        course: courseToSend
    });
});



const UpdateCourse = asynchandler(async (req, res) => {
    // 1. التحقق من البيانات المرسلة
    const { error } = validatupdatecourse(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message }); // 400 Bad Request
    }

    // 2. التحديث المباشر وتفادي قيم undefined
    const course = await Course.findByIdAndUpdate(
        req.params.id,
        { $set: req.body }, // يدمج فقط الحقول الموجودة في req.body
        { new: true, runValidators: true }
    );

    if (!course) {
        return res.status(404).json({ message: "course not found" });
    }

    return res.status(200).json({ status: "success", course: course });
});
const PostImageCourse = asynchandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "no image provided" });
    }

    const pathimg = path.join(__dirname, `../images/${req.file.filename}`);

    // التحقق من وجود الكورس أولاً قبل رفع الصورة لسيرفر السحاب (Optimization)
    const course = await Course.findById(req.params.id);
    if (!course) {
        if (fs.existsSync(pathimg)) fs.unlinkSync(pathimg);
        return res.status(404).json({ message: "Course not found" });
    }



    const reqUserId = req.user.id || req.user._id;
    const t = await Teacher.findOne({ userId: reqUserId });

    if (course.teacher_id.toString() == t._id.toString()) {
        console.log("User is authorized to upload image for this course");
        const result = await UploadFile(pathimg);

        if (course.image && course.image.publicId) {
            await RemoveImage(course.image.publicId);
        }

        course.image = {
            url: result.secure_url,
            publicId: result.public_id
        };

        await course.save();
        if (fs.existsSync(pathimg)) fs.unlinkSync(pathimg);

        return res.status(200).json({
            message: "Image uploaded successfully",
            courseImage: { url: result.secure_url, publicId: result.public_id }
        });
    } else {
        if (fs.existsSync(pathimg)) fs.unlinkSync(pathimg);
        return res.status(403).json({ message: "You are not authorized to upload image for this course" });
    }
});


const GetCourses = asynchandler(async (req, res) => {

    const courses = await Course.find().populate('category').populate('teacher_id').populate('userId');
    res.status(200).json({ status: "success", courses })

})

const GetMyCourses = asynchandler(async (req, res) => {

    const teacher = await Teacher.findOne({ userId: req.user.id });
    const courses = await Course.find({ teacher_id: teacher.id }).populate('category').populate('userId');;
    console.log("Teacher ID:", teacher.id);
    console.log("useer:", req.user.id);
    res.status(200).json({ status: "success", courses })

})

const DeleteCourse = asynchandler(async (req, res) => {

    let course = await Course.findById(req.params.id)
    if (!course) {
        return res.status(404).json({ message: "course not found" });
    }

    const reqUserId = req.user.id || req.user._id;
    const teacher = await Teacher.findOne({ userId: req.user.id });
    const isOwner = course.teacher_id.toString() === teacher.id;
    const isAdmin = req.user.role === 'admin';

    if (isOwner || isAdmin) {
        await Course.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "course deleted successfully" });
    } else {
        return res.status(403).json({ message: "you are not authorized to delete this course" });
    }
});
const getFundCourses = asynchandler(async (req, res) => {
    const courses = await Course.find({ isfounder: true }).populate('category').populate('teacher_id').populate('userId');;
    res.status(200).json({ status: "success", courses });
});
const setvip = asynchandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "course not found" });
    }

    const reqUserId = req.user.id || req.user._id;
    const teacher = await Teacher.findOne({ userId: req.user.id });
    const isOwner = course.teacher_id.toString() === teacher.id;

    if (isOwner) {
        if (course.isfounder == true) {
            return res.status(400).json({ message: "course is already founder" });
        }
        course.isfounder = true;
        course.adminPercentage += 15
        await course.save();
        res.status(200).json({ status: "success", message: `course founder status set to ${course.isfounder}` });
    } else {
        return res.status(403).json({ message: "you are not authorized to change this course's founder status" });
    }
});

const FilterCourses = asynchandler(async (req, res) => {
    const { keyword, category } = req.query;

    let filterQuery = {};

    if (keyword) {
        filterQuery.title = { $regex: keyword, $options: 'i' };
    }

    if (category) {
        filterQuery.category = category;
    }

    const courses = await Course.find(filterQuery)
        .select('-lessons')
        .populate('teacher_id', 'name email').populate('userId').populate('category');

    if (courses.length === 0) {
        return res.status(404).json({ message: "No courses found matching your criteria" });
    }

    res.status(200).json({
        status: "success",
        results: courses.length,
        courses
    });
});

const addCommentTolesson = asynchandler(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const { text, rating } = req.body;

    if (!text || !rating) {
        return res.status(400).json({ message: "Comment text and rating are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const newComment = {
        text,
        userId: req.user.id,
        Rating: rating
    };

    course.lessons.id(lessonId).Comments.push(newComment);
    await course.save();

    res.status(201).json({ status: "success", comment: newComment });
});

const PurchaseCourse = asynchandler(async (req, res) => {
    const purchaserId = req.user.id || req.user._id;
    const purchaserRole = req.user.role;
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);
    if (!course || course.status !== 'approved') {
        return res.status(400).json({ message: "الكورس غير موجود أو غير متاح للشراء" });
    }

    const teacher = await Teacher.findById(course.teacher_id);
    if (!teacher) {
        return res.status(404).json({ message: "المعلم غير موجود" });
    }

    let finalPrice = course.price;
    let discountAmount = 0;
    const { discount_code } = req.body;

    if (discount_code) {
        const discount = await Discount.findOne({ code: discount_code });
        if (!discount) {
            return res.status(404).json({ message: "كود الخصم غير صحيح أو غير موجود" });
        }
        discountAmount = (course.price * discount.discount_precentage) / 100;
        finalPrice = course.price - discountAmount;
    }


    const platformFeePercentage = 0.20;
    const platformFee = finalPrice * platformFeePercentage;
    const teacherEarnings = finalPrice - platformFee;

    if (purchaserRole === 'parent') {
        const { child_id } = req.body; 

        if (!child_id) {
            return res.status(400).json({ message: "يجب إرسال معرف الابن (child_id)" });
        }

        const childAccount = await ChiledAccount.findOne({ _id: child_id, parent_id: purchaserId });
        if (!childAccount) {
            return res.status(403).json({ message: "حساب هذا الطفل غير مسجل لديك" });
        }

        if (childAccount.courses.includes(courseId)) {
            return res.status(400).json({ message: "هذا الطفل يمتلك الكورس مسبقاً" });
        }

        const parent = await Parent.findOne({ userId: purchaserId }) || await Parent.findById(purchaserId);
        if (!parent || parent.money_balance < finalPrice) {
            return res.status(400).json({ message: "رصيدك غير كافي لشراء هذا الكورس" });
        }

       
        parent.money_balance -= finalPrice;
        await parent.save();

     
        childAccount.courses.push(course._id);
        await childAccount.save();

        const transaction = await Transaction.create({
            parent_id: parent._id,
            child_id: childAccount._id,
            course_id: course._id,
            amount: finalPrice,    
            platform_fee: platformFee,
            instructor_earnings: teacherEarnings,
            payment_status: 'completed'
        });

        const enrollment = await Enrollment.create({
            child_id: childAccount._id, 
            userId: purchaserId,
            teacher_id: course.teacher_id,
            course_id: course._id,
            price: finalPrice,
            progress_percentage: 0,
            completion_status: 'in_progress',
            certificate_issued: false
        });

        teacher.total_student++;
        await teacher.save();

        return res.status(201).json({ 
            status: "success", 
            message: discountAmount > 0 
                ? `تم شراء الكورس للابن مع الخصم! تم توفير ${discountAmount}` 
                : "تم شراء الكورس للابن بنجاح", 
            transactionId: transaction._id,
            enrollmentData: enrollment
        });
    } else if (purchaserRole === 'student') {
        
        const student = await Student.findOne({ userId: purchaserId });
        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const alreadyEnrolled = await Enrollment.findOne({ student_id: student._id, course_id: courseId });
        if (alreadyEnrolled) {
            return res.status(400).json({ message: "أنت تمتلك هذا الكورس مسبقاً" });
        }

        if (student.money_balance < finalPrice) {
            return res.status(400).json({ message: "رصيدك غير كافي لشراء هذا الكورس" });
        }
        student.money_balance -= finalPrice;
        student.enrolled_courses_count++;
        await student.save();

        const transaction = await Transaction.create({
            student_id: student._id,
            course_id: course._id,
            amount: finalPrice, 
            platform_fee: platformFee,
            instructor_earnings: teacherEarnings,
            payment_status: 'completed'
        });

        const enrollment = await Enrollment.create({
            student_id: student._id,
            userId: purchaserId,
            teacher_id: course.teacher_id,
            course_id: course._id,
            price: finalPrice,
            progress_percentage: 0,
            completion_status: 'in_progress',
            certificate_issued: false
        });

        teacher.total_student++;
        await teacher.save();

        return res.status(201).json({
            status: "success",
            message: discountAmount > 0 
                ? `تم تطبيق الخصم بنجاح! تم خصم ${discountAmount} من السعر.` 
                : "تم شراء الكورس بنجاح",
            transactionId: transaction._id,
            enrollmentData: enrollment
        });

    } else {
        return res.status(403).json({ message: "فقط الطلاب والآباء يمكنهم شراء الكورسات" });
    }
});

const GetChildPurchasedCourses = asynchandler(async (req, res) => {
    const parentId = await Parent.findOne({ userId: req.user.id });
    const childId = req.params.childId; 
    if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "فقط الآباء يمكنهم عرض كورسات أبنائهم" });
    }
    const childAccount = await ChiledAccount.findOne({
        student_id: childId,
        parent_id: parentId._id
    });
    if (!childAccount) {
        return res.status(403).json({ message: "هذا الحساب غير مسجل كابن لديك أو غير موجود" });
    }
    const enrollments = await Enrollment.find({ student_id: childId })
        .populate({
            path: 'course_id',
            select: 'title description image price teacher_id' 
        });
    if (!enrollments || enrollments.length === 0) {
        return res.status(404).json({ message: "لا يوجد كورسات مشتراة لهذا الابن حتى الآن" });
    }
    res.status(200).json({
        status: "success",
        results: enrollments.length,
        enrollments
    });
});

const CourseForTeacher = asynchandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    const teacher = await Teacher.findOne(req.params.teacherId);
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    let courses = await Course.find({ teacher_id: teacher._id }).populate('category').populate('userId');
    res.status(200).json({ status: "success", courses });
});

const SubmitLessonQuiz = asynchandler(async (req, res) => {

    const { student_id, course_id, lesson_id, answers } = req.body;
    
    const student = await Student.findById(student_id);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const course = await Course.findById(course_id);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const lesson = course.lessons.id(lesson_id);
    if (!lesson) {
        return res.status(404).json({ message: "Lesson not found in this course" });
    }

    if (!lesson.hasquiz || !lesson.quiz || lesson.quiz.questions.length === 0) {
        return res.status(400).json({ message: "This lesson does not have a quiz" });
    }

    let correctCount = 0;
    let pointsEarned = 0;
    for (const item of answers) {
        const question = lesson.quiz.questions.id(item.question_id);
        
        if (question && question.correct_answer === item.selected_option) {
            correctCount++;
            pointsEarned += 2; 
        }
    }

    if (pointsEarned > 0) {
        student.points_balance = (student.points_balance || 0) + pointsEarned;
        await student.save();
        
    }

    res.status(200).json({
        status: "success",
        result: {
            total_questions: lesson.quiz.questions.length,
            correct_answers: correctCount,
            points_earned: pointsEarned,
            total_points: student.points_balance
        },
        message: pointsEarned > 0 
            ? `Congratulations! You answered ${correctCount} questions correctly and earned ${pointsEarned} points.` 
            : "No points earned. Better luck next time!"
    });
});


module.exports = {
    CreateCourse,
    PostCourseFiles,
    GetCourse,
    getCoursesAtCatogaries,
    UpdateCourse,
    GetCourses,
    DeleteCourse,
    PostImageCourse,
    PurchaseCourse,
    setvip,
    getFundCourses,
    FilterCourses,
    GetMyCourses,
    addCommentTolesson,
    SubmitLessonQuiz,
    CourseForTeacher,
    GetChildPurchasedCourses
};