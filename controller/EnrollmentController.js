const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreateenrollment, validateupdateenrollment, Enrollment } = require("../models/Enrollment");
const { Course } = require("../models/Course");


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
    res.status(201).json({ status: "success", enrollment: NewEnrollment });
})


const GetEnrollment = asynchandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    res.status(200).json({ status: "success", enrollment });
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
        res.status(200).json({ status: "success", enrollment });
    } else {
        res.status(403).json({ message: "Unauthorized Do it" });
    }
})

const GetEnrollments = asynchandler(async (req, res) => {
    const enrollments = await Enrollment.find();
    if (req.user.role == "teacher" || req.user.role == "admin") {
        res.status(200).json({ status: "success", enrollments });
    } else {
        res.status(403).json({ message: "Unauthorized Do it" });
    }
})

const DeleteEnrollment = asynchandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    if (req.user.role == "teacher" || req.user.role == "admin") {
        await Enrollment.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "Enrollment deleted successfully" });
    }
    else {
        res.status(403).json({ message: "Unauthorized Do it" });
    }
})


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
    CompleteLesson
}
