const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatupdatecourse, Course, validatecreatecourse } = require("../models/Course");
const { UploadFile, RemoveImage } = require("../utils/cloudinary"); // تأكد من استيراد RemoveImage
const { Enrollment } = require("../models/Enrollment");
const { Transaction } = require("../models/Transaction");

const CreateCourse = asynchandler(async (req, res) => {
    const { title, description, category, price } = req.body;
    
    const { error } = validatecreatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message });
    }

    if (req.user.role === 'teacher') {
        let NewCourse = await Course.create({
            teacher_id: req.user.id || req.user._id, 
            title,
            description,
            category,
            price
        });
        res.status(201).json({ status: "success", course: NewCourse });
    } else {
        res.status(403).json({ message: "only teachers can create courses" });
    }
});

const PostCourseFiles = asynchandler(async (req, res) => {
    if (!req.files || !req.files.video) {
        return res.status(400).json({ message: "Video file is required" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const reqUserId = req.user.id || req.user._id;
    if (course.teacher_id.toString() !== reqUserId.toString()) {
        return res.status(403).json({ message: "You are not authorized to add lessons to this course" });
    }

    const videoFile = req.files.video[0];
    const videoPath = path.join(__dirname, `../videos/${videoFile.filename}`);
    
    const videoResult = await UploadFile(videoPath); 
    let pdfResult = null;
    let pdfPath = null;
    
    if (req.files.pdf) {
        const pdfFile = req.files.pdf[0];
        pdfPath = path.join(__dirname, `../pdfs/${pdfFile.filename}`);
        pdfResult = await UploadFile(pdfPath);
    }

    course.lessons.push({
        title: req.body.title,
        description: req.body.description, 
        contentType: req.body.contentType || 'video', 
        video_content: {
            url: videoResult.secure_url,
            publicId: videoResult.public_id
        },
        pdf_content: pdfResult ? {
            url: pdfResult.secure_url,
            publicId: pdfResult.public_id
        } : undefined
    });

    await course.save();
    fs.unlinkSync(videoPath);
    if (pdfPath) fs.unlinkSync(pdfPath);

    res.status(201).json({
        message: "Lesson added successfully",
        lesson: course.lessons[course.lessons.length - 1]
    });
});

// 3. Get Course Details (Lock/Unlock logic)
const GetCourse = asynchandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate('teacher_id');
    if (!course) {
        return res.status(404).json({ message: "course not found" });
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
        } catch (error) {}
    }
    
    if (userId) {
        const isAdmin = userRole === 'admin';
        const isOwner = course.teacher_id && course.teacher_id._id && 
                        course.teacher_id._id.toString() === userId.toString();

        if (isAdmin || isOwner) {
            isAuthorized = true; 
        } else {
            const enrollment = await Enrollment.findOne({ student_id: userId, course_id: course._id });
            if (enrollment) {
                isAuthorized = true;
            }
        }
    }

    let courseToSend = course.toObject();
    if (!isAuthorized) {
        if (courseToSend.lessons && courseToSend.lessons.length > 0) {
            courseToSend.lessons = courseToSend.lessons.map(lesson => {
                return {
                    _id: lesson._id,
                    title: lesson.title,
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
    const { title, description, category, price, isfounder, founding_ratio } = req.body; // شلنا teacher_id من التعديل
    const { error } = validatupdatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message });
    }

    let course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "course not found" });
    }

    const reqUserId = req.user.id || req.user._id;
    if (course.teacher_id.toString() === reqUserId.toString()) {
        course = await Course.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                title,
                description,
                category,
                price,
                isfounder,
                founding_ratio
            }
        }, { new: true }).populate('teacher_id');
        
        return res.status(202).json({ status: "success", course: course });
    } else { 
        return res.status(403).json({ message: "you are not authorized to update this course" }); 
    }
});

const PostImageCourse = asynchandler(async (req, res) => {
    if (!req.file) {
        return res.status(404).json({ message: "no image provided" });
    }
    const pathimg = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await UploadFile(pathimg);
    
    const course = await Course.findById(req.params.id);
    const reqUserId = req.user.id || req.user._id;

    if (course.teacher_id.toString() === reqUserId.toString()) {
        if (course.image && course.image.publicId !== null) {
            await RemoveImage(course.image.publicId);
        }
        course.image = {
            url: result.secure_url,
            publicId: result.public_id
        };
        await course.save();
        fs.unlinkSync(pathimg);
        
        return res.status(201).json({ message: "image uploaded successfully", courseImage: { url: result.secure_url, publicId: result.public_id } });
    } else {
        fs.unlinkSync(pathimg); 
        return res.status(403).json({ message: "you are not authorized to upload image for this course" });
    }
});


const GetCourses = asynchandler(async (req, res) => {
    const courses = await Course.find().select('-lessons');
    res.status(200).json({ status: "success", courses });
});


const DeleteCourse = asynchandler(async (req, res) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "course not found" });
    }
    
    const reqUserId = req.user.id || req.user._id;
    const isOwner = course.teacher_id.toString() === reqUserId.toString();
    const isAdmin = req.user.role === 'admin';

    if (isOwner || isAdmin) {
        await Course.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "course deleted successfully" });
    } else {
        return res.status(403).json({ message: "you are not authorized to delete this course" });
    }
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
    PurchaseCourse
};