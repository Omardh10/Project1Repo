const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreateteacher, validateupdateteacher,Teacher } = require("../models/Teacher");
const { Following } = require("../models/Following");


const CreateTeacher = asynchandler(async (req, res) => {

    const { error } = validatecreateteacher(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewTeacher = Teacher.create({
        userId: req.body.userId,
        total_student: req.body.total_student,
        total_courses: req.body.total_courses
    })
    await NewTeacher.save();
    res.status(201).json({ status: "success", teacher: NewTeacher });

})


const GetTeacher = asynchandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ status: "success", teacher });

})

const GetMyProfile = asynchandler(async (req, res) => {
      const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ status: "success", teacher });

})

const GetTeachersPercentage = asynchandler(async (req, res) => {
   const admin = await Admin.find();
   return res.status(200).json({ status: "success", platform_fee_precentage: admin[0].platform_fee_precentage });
})


const createquiz = asynchandler(async (req, res) => {
    const {title, questions, options, correct_answers, lessonId} = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (course.lessons.id(lessonId).hasquiz) {
        return res.status(400).json({ message: "Quiz already exists for this lesson" });
    }
    course.lessons.id(lessonId).quiz = { title, questions, options, correct_answers };
    course.lessons.id(lessonId).hasquiz = true;
    await course.save();
   return res.status(201).json({ status: "success", quiz: course.lessons.id(lessonId).quiz });
});

const getStudentDetailsForTeacher = asynchandler(async (req, res) => {
    const { userId } = req.params; // userId أو student_id الخاص بالطالب

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
        return res.status(404).json({ message: "حساب المعلم غير موجود" });
    }

    // جلب كافة اشتراكات هذا الطالب في كورسات هذا المعلم تحديداً
    const enrollments = await Enrollment.find({ 
        userId: userId, 
        teacher_id: teacher._id 
    })
    .populate('course_id', 'title image duration lessons price category')
    .populate('userId', 'fullname email profilephoto Gender birthdate');

    if (!enrollments || enrollments.length === 0) {
        return res.status(404).json({ message: "لم يتم العثور على بيانات هذا الطالب مع هذا المعلم" });
    }

    const studentInfo = enrollments[0].userId;

    const coursesData = enrollments.map(e => ({
        enrollmentId: e._id,
        courseId: e.course_id?._id,
        courseTitle: e.course_id?.title || 'كورس غير متاح',
        courseImage: e.course_id?.image?.url || '',
        totalLessons: e.course_id?.lessons?.length || 0,
        completedLessonsCount: e.completed_lessons?.length || 0,
        progress: e.progress || 0,
        completionStatus: e.completion_status,
        enrolledAt: e.createdAt
    }));

    res.status(200).json({
        status: "success",
        student: {
            id: studentInfo._id,
            fullname: studentInfo.fullname,
            email: studentInfo.email,
            profilephoto: studentInfo.profilephoto,
            gender: studentInfo.Gender
        },
        courses: coursesData,
        // مساحة مخصصة للاختبارات سيتم ربطها لاحقاً
        quizzes: []
    });
});

const GetTeacherByUserId = asynchandler(async (req, res) => {
    const teacher = await Teacher.findOne({ userId: req.params.id });
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ status: "success", teacher });

})


const UpdateTeacher = asynchandler(async (req, res) => {
    const { error } = validateupdateteacher(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    if (teacher.userId.toString() == req.user.id || req.user.role === "admin") {
        teacher = await Teacher.findByIdAndUpdate(req.params.id, {
            $set: {
                userId: req.body.userId,
                total_student: req.body.total_student,
                total_courses: req.body.total_courses
            }
        }, { new: true })
        res.status(202).json({ status: "success", teacher })
    } else {
        res.status(403).json({ message: "You cannot update your own teacher profile" });
    }
})

const GetTeachers = asynchandler(async (req, res) => {
    const teachers = await Teacher.find();
    res.status(200).json({ status: "success", teachers })
})

const DeleteTeacher = asynchandler(async (req, res) => {
    let teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    if (teacher.userId.toString() == req.user.id || req.user.role === "admin") {
        await Teacher.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "Teacher deleted successfully" })
    }
    else {
        res.status(403).json({ message: "You cannot delete your own teacher profile" });
    }

})


const FollowTeacher = asynchandler(async (req, res) => {

    const teacherId = req.params.id;
    const studentId = req.user.id;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    const alreadyFollowing = await Following.findOne({
        student_id: studentId,
        teacher_id: teacherId
    });

    if (alreadyFollowing) {
        return res.status(400).json({ message: "You are already following this teacher" });
    }

    const newFollow = await Following.create({
        student_id: studentId,
        teacher_id: teacherId
    });
    res.status(201).json({
        status: "success",
        message: "Successfully followed the teacher",
        followData: newFollow
    });
});

module.exports = {
    CreateTeacher,
    GetTeacher,
    UpdateTeacher,
    GetTeachers,
    DeleteTeacher,
    FollowTeacher,
     GetTeacherByUserId,
    GetMyProfile,
    GetTeachersPercentage,
    createquiz
}