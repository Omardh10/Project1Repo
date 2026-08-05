const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreateenrollment, validateupdateenrollment, Enrollment } = require("../models/Enrollment");
const { Course } = require("../models/Course");
const {Teacher} = require('../models/Teacher')

const CreateEnrollment = asynchandler(async (req, res) => {
    const { error } = validatecreateenrollment(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewEnrollment = Enrollment.create({
        student_id: req.body.student_id,
        course_id: req.body.course_id,
        progress: req.body.progress,
        completion_status: req.body.completion_status,
        certificate_issued: req.body.certificate_issued
    })
    await NewEnrollment.save();
   return res.status(201).json({ status: "success", enrollment: NewEnrollment });
})


const GetEnrollment = asynchandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
   return  res.status(200).json({ status: "success", enrollment });
})

const UpdateEnrollment = asynchandler(async (req, res) => {
    const { error } = validateupdateenrollment(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    if (req.user.role == "teacher" || req.user.role == "admin") {
        enrollment = await Enrollment.findByIdAndUpdate(req.params.id, {
            $set: {
                student_id: req.body.student_id,
                course_id: req.body.course_id,
                progress: req.body.progress,
                completion_status: req.body.completion_status,
                certificate_issued: req.body.certificate_issued
            }
        }, { new: true });
        return res.status(200).json({ status: "success", enrollment });
    } else {
        return res.status(403).json({ message: "Unauthorized Do it" });
    }
})

const GetEnrollments = asynchandler(async (req, res) => {
    const enrollments = await Enrollment.find().populate('student_id', '-password -token').populate('course_id');
    return res.status(200).json({ status: "success", enrollments });
    if (req.user.role == "teacher" || req.user.role == "admin") {
        return res.status(200).json({ status: "success", enrollments });
    } else {
        return res.status(403).json({ message: "Unauthorized Do it" });
    }
})
const GetEnrollmentsTeacher = asynchandler(async (req, res) => {
    const teacher = await Teacher.findOne({userId: req.user.id})
    const enrollments = await Enrollment.find({teacher_id: teacher.id }).populate('student_id').populate('userId').populate('course_id')
   return res.status(200).json({ status: "success", enrollments });
    if (req.user.role == "teacher" || req.user.role == "admin") {
       return res.status(200).json({ status: "success", enrollments });
    } else {
        return res.status(403).json({ message: "Unauthorized Do it" });
    }
})

const DeleteEnrollment = asynchandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    if (req.user.role == "teacher" || req.user.role == "admin") {
        await Enrollment.deleteOne({ _id: req.params.id });
        return res.status(200).json({ status: "success", message: "Enrollment deleted successfully" });
    }
    else {
        return res.status(403).json({ message: "Unauthorized Do it" });
    }
})

const getStudentOfTeacher = asynchandler(async (req, res) => {
    // 1. قراءة المعاملات (الصفحة، العدد، كلمة البحث)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // 2. البحث عن المعلم المرتبط بحساب المستخدم الحالي
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
        return res.status(404).json({ message: "حساب المعلم غير موجود" });
    }

    // 3. بناء الـ Aggregation Pipeline
    const pipeline = [
        // أ. تصفية الاشتراكات التابعة لهذا المعلم فقط
        { $match: { teacher_id: teacher._id } },

        // ب. إلغاء التكرار بالتجميع حسب userId الخاِص بالطالب
        {
            $group: {
                _id: "$userId", // تجميع حسب الـ User المباشر
                student_id: { $first: "$student_id" },
                totalEnrolledCourses: { $sum: 1 }, // عدد الكورسات التي سجل فيها مع هذا المعلم
                firstEnrolledAt: { $min: "$createdAt" }
            }
        },

        // ج. جلب بيانات المستخدم من مجموعة users
        {
            $lookup: {
                from: "users", // اسم الـ collection في Mongoose هو الجمع الصغير مفترضاً (users)
                localField: "_id",
                foreignField: "_id",
                as: "userData"
            }
        },
        { $unwind: "$userData" },

        // د. جلب نقاط الطالب وحالته من مجموعة students (اختياري)
        {
            $lookup: {
                from: "students",
                localField: "student_id",
                foreignField: "_id",
                as: "studentData"
            }
        },
        { 
            $unwind: { 
                path: "$studentData", 
                preserveNullAndEmptyArrays: true 
            } 
        }
    ];

    // هـ. تطبيق البحث (Search) إذا قُدِّمت كلمة البحث
    if (search.trim() !== "") {
        pipeline.push({
            $match: {
                $or: [
                    { "userData.fullname": { $regex: search, $options: "i" } },
                    { "userData.email": { $regex: search, $options: "i" } }
                ]
            }
        });
    }

    // و. إضافة الترقيم (Pagination) وحساب الإجمالي باستخدام $facet
    pipeline.push({
        $facet: {
            metadata: [{ $count: "total" }],
            data: [
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: "$userData._id",
                        student_id: "$student_id",
                        fullname: "$userData.fullname",
                        email: "$userData.email",
                        gender: "$userData.Gender",
                        profilephoto: "$userData.profilephoto",
                        points_balance: "$studentData.points_balance",
                        totalEnrolledCourses: 1,
                        firstEnrolledAt: 1
                    }
                }
            ]
        }
    });

    // 4. تنفيذ الاستعلام
    const result = await Enrollment.aggregate(pipeline);

    const students = result[0].data;
    const totalStudents = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const totalPages = Math.ceil(totalStudents / limit);

    // 5. إرجاع النتيجة
    res.status(200).json({
        status: "success",
        results: students.length,
        pagination: {
            totalStudents,
            currentPage: page,
            totalPages,
            limit
        },
        students
    });
});

const CompleteLesson = asynchandler(async (req, res) => {
    const studentId = req.user.id;
    const { courseId, lessonId } = req.body; 

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
  
    const totalLessons = course.lessons.length; 
    if (totalLessons === 0) {
        return res.status(400).json({ message: "This course has no lessons yet" });
    }

    let enrollment = await Enrollment.findOneAndUpdate(
        { student_id: studentId, course_id: courseId },
        { $addToSet: { completed_lessons: lessonId } },
        { new: true }
    );

    if (!enrollment) {
        return res.status(404).json({ message: "You are not enrolled in this course" });
    }

    const completedCount = enrollment.completed_lessons.length; 
    const progress = Math.round((completedCount / totalLessons) * 100)
    let status = 'in_progress';
    let isCertificateIssued = false;

    if (progress === 100) {
        status = 'completed';
        isCertificateIssued = true;
    }

    enrollment.progress_percentage = progress;
    enrollment.completion_status = status;
    enrollment.certificate_issued = isCertificateIssued;
    await enrollment.save();

    res.status(200).json({
        status: "success",
        progress_percentage: enrollment.progress_percentage,
        completion_status: enrollment.completion_status,
        message: progress === 100 ? "Congratulations! You completed the course." : "Progress updated"
    });
});

module.exports = {
    CreateEnrollment,
    GetEnrollment,
    UpdateEnrollment,
    GetEnrollments,
    DeleteEnrollment,
    CompleteLesson,
    GetEnrollmentsTeacher,
    getStudentOfTeacher
}
