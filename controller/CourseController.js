const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatupdatecourse, Course, validatecreatecourse } = require("../models/Course");
const { UploadFile } = require("../utils/cloudinary");
const { RemoveImage } = require("../utils/cloudinary");
const { validatecreateteacher, validateupdateteacher , Teacher} = require("../models/Teacher");

const CreateCourse = asynchandler(async (req, res) => {

    const { teacher_id, title, description, category, price, lessons } = req.body
    const { error } = validatecreatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }

    const NewCourse =await Course.create({
        teacher_id,
        title,
        description,
        category,
        price
    })
  
    res.status(201).json({ status: "success", course: NewCourse });
})
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
const GetCourse = asynchandler(async (req, res) => {

    const course = await Course.findById(req.params.id).populate('category');
    if (!course) {
        return res.status(404).json({ message: "course not found" })
    }
    res.status(201).json({ status: "success", course })

})
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

const GetCourses = asynchandler(async (req, res) => {

    const courses = await Course.find();
    res.status(200).json({ status: "success", courses })

})

const GetMyCourses = asynchandler(async (req, res) => {
 
    const teacher = await Teacher.findOne({ userId: req.user.id });
    const courses = await Course.find({ teacher_id: teacher.id }).populate('category');
    console.log("Teacher ID:", teacher.id);
    console.log("useer:" , req.user.id);
    res.status(200).json({ status: "success", courses })

})

const DeleteCourse = asynchandler(async (req, res) => {

    let course = await Course.findById(req.params.id)
    if (!course) {
        return res.status(404).json({ message: "course not found" })
    }
    await Course.findByIdAndDelete(req.params.id)

    res.status(201).json({ status: "success", message: "course deleted seccussfully" })

})

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
        .populate('teacher_id', 'name email'); 

    if (courses.length === 0) {
        return res.status(404).json({ message: "No courses found matching your criteria" });
    }

    res.status(200).json({ 
        status: "success", 
        results: courses.length,
        courses 
    });
});

const PurchaseCourse = asynchandler(async (req, res) => {
    const purchaserId = req.user.id || req.user._id; 
    const purchaserRole = req.user.role;
    const courseId = req.params.courseId;
    let finalStudentId = purchaserId;


    if (purchaserRole === 'parent') {

        const { target_student_id } = req.body; 

        if (!target_student_id) {
            return res.status(400).json({ message: "يجب إرسال معرف الابن (target_student_id) لشراء الكورس له" });
        }
        const childAccount = await ChiledAccount.findOne({
            student_id: target_student_id,
            parent_id: purchaserId
        });

        if (!childAccount) {
            return res.status(403).json({ message: "هذا الحساب غير مسجل كابن لديك" });
        }

        finalStudentId = target_student_id;
        
    } else if (purchaserRole !== 'student') {

        return res.status(403).json({ message: "فقط الطلاب والآباء يمكنهم شراء الكورسات" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (course.status !== 'approved') {
        return res.status(400).json({ message: "This course is not available for purchase" });
    }

    const alreadyEnrolled = await Enrollment.findOne({ student_id: finalStudentId, course_id: courseId });
    if (alreadyEnrolled) {
        return res.status(400).json({ message: "هذا الطالب يمتلك الكورس مسبقاً" });
    }
    const platformFeePercentage = 0.20; 
    const platformFee = course.price * platformFeePercentage;
    const teacherEarnings = course.price - platformFee;

    const transaction = await Transaction.create({
        student_id: finalStudentId, 
        course_id: course._id,
        amount: course.price,     
        platform_fee: platformFee,
        instructor_earnings: teacherEarnings,
        payment_status: 'completed'
    });


    const enrollment = await Enrollment.create({
        student_id: finalStudentId, 
        course_id: course._id,
        progress_percentage: 0,
        completion_status: 'in_progress',
        certificate_issued: false
    });
    
    res.status(201).json({ 
        status: "success", 
        message: "Course purchased successfully", 
        transactionId: transaction._id,
        enrollmentData: enrollment
    });
});


module.exports = {
    CreateCourse,
    PostCourseFiles,
    GetCourse,
    UpdateCourse,
    GetCourses,
    DeleteCourse,
    PostImageCourse,
    GetMyCourses
    
}
