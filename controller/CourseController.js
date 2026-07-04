const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatupdatecourse, Course, validatecreatecourse } = require("../models/Course");
const { UploadFile } = require("../utils/cloudinary");
const { Enrollment } = require("../models/Enrollment");
const { Transaction } = require("../models/Transaction");

const CreateCourse = asynchandler(async (req, res) => {

    const { teacher_id, title, description, category, price, lessons } = req.body
    const { error } = validatecreatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }

    if (req.user.role !== 'teacher') {
        let NewCourse = Course.create({

            teacher_id,
            title,
            description,
            category,
            price
        })
        await NewCourse.save();
        res.status(201).json({ status: "success", course: NewCourse });
    } else {
        res.status(403).json({ message: "only teachers can create courses" })
    }
})

const PostCourseFiles = asynchandler(async (req, res) => {

    if (!req.file) {
        return res.status(404).json({ message: "no course file provided" })
    }

    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'pdf';
    const folderPath = fileType === 'video' ? '../videos' : '../pdfs';

    // get the path:
    const filePath = await path.join(__dirname, `${folderPath}/${req.file.filename}`)
    const result = await UploadImage(filePath);

    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "course not found" });
    }

    course.lessons.push({
        title: req.body.title,
        contentType: req.body.contentType,
        pdf_content: fileType === 'pdf' ? {
            url: result.secure_url,
            publicId: result.public_id
        } : undefined,
        video_content: fileType === 'video' ? {
            url: result.secure_url,
            publicId: result.public_id
        } : undefined
    })

    await course.save();
    res.status(201).json({
        message: "file uploaded successfully",
        courseFile: {
            type: fileType,
            url: result.secure_url,
            publicId: result.public_id
        }
    });

    fs.unlinkSync(filePath);
})

const GetCourse = asynchandler(async (req, res) => {

    const course = await Course.findById(req.params.id).populate('teacher_id');
    if (!course) {
        return res.status(404).json({ message: "course not found" })
    }
    res.status(201).json({ status: "success", course })

})

const UpdateCourse = asynchandler(async (req, res) => {

    const { teacher_id, title, description, category, price, isfounder, founding_ratio } = req.body
    const { error } = validatupdatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let course = await Course.findById(req.params.id).populate('teacher_id');
    if (!course) {
        return res.status(404).json({ message: "course not found" })
    }
    if (course.teacher_id.userId.toString() == req.user._id.toString()) {
        course = await Course.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                teacher_id,
                title,
                description,
                category,
                price,
                isfounder,
                founding_ratio
            }
        }, { new: true })
        return res.status(202).json({ status: "success", course: course })
    } else { return res.status(403).json({ message: "you are not authorized to update this course" }) }

})

const PostImageCourse = asynchandler(async (req, res) => {

    if (!req.file) {
        return res.status(404).json({ message: "no image provided" })
    }
    //get the path:
    const pathimg = await path.join(__dirname, `../images/${req.file.filename}`)
    const result = await UploadFile(pathimg);
    const course = await Course.findById(req.params.id).populate('teacher_id');
    if (course.teacher_id.userId.toString() == req.user._id.toString()) {
        if (course.image.publicId !== null) {
            await RemoveImage(course.image.publicId);
        }
        course.image = {
            url: result.secure_url,
            publicId: result.public_id
        }
        await course.save();

        return res.status(201).json({ message: "image uploaded seccussfully", courseImage: { url: result.secure_url, publicId: result.public_id } });
        fs.unlinkSync(pathimg);
    } else {
        return res.status(403).json({ message: "you are not authorized to upload image for this course" })
    }
})

const GetCourses = asynchandler(async (req, res) => {

    const courses = await Course.find();
    res.status(200).json({ status: "success", courses })

})

const DeleteCourse = asynchandler(async (req, res) => {

    let course = await Course.findById(req.params.id)
    if (!course) {
        return res.status(404).json({ message: "course not found" })
    }
    if (course.teacher_id.userId.toString() == req.user._id.toString() || req.user.role == 'admin') {
        await Course.deleteOne({ _id: req.params.id })

        res.status(201).json({ status: "success", message: "course deleted seccussfully" })
    } else {
        return res.status(403).json({ message: "you are not authorized to delete this course" })
    }

})


// Purchase a course     معلومات الشراء الخاصة بالكورس  
const PurchaseCourse = asynchandler(async (req, res) => {

    const studentId = req.user.id; 
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (course.status !== 'approved') {
        return res.status(400).json({ message: "This course is not available for purchase" });
    }

    const alreadyEnrolled = await Enrollment.findOne({ student_id: studentId, course_id: courseId });
    if (alreadyEnrolled) {
        return res.status(400).json({ message: "You already own this course" });
    }

    const platformFeePercentage = 0.20; 
    const platformFee = course.price * platformFeePercentage;
    const teacherEarnings = course.price - platformFee;

    const transaction = await Transaction.create({
        student_id: studentId,
        course_id: course._id,
        amount_paid: course.price,
        platform_fee: platformFee,
        instructor_earnings: teacherEarnings,
        payment_status: 'completed'
    });

    const enrollment = await Enrollment.create({
        student_id: studentId,
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
}