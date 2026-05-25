const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatupdatecourse, Course, validatecreatecourse } = require("../models/Course");
const { UploadFile } = require("../utils/cloudinary");

const CreateCourse = asynchandler(async (req, res) => {

    const { teacher_id, title, description, category, price, lessons } = req.body
    const { error } = validatecreatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }

    let NewCourse = Course.create({

        teacher_id,
        title,
        description,
        category,
        price
    })
    await NewCourse.save();
    res.status(201).json({ status: "success", course: NewCourse });
})

const PostCourseFiles = asynchandler(async (req, res) => {

    if (!req.file) {
        return res.status(404).json({ message: "no course file provided" })
    }

    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'pdf';
    const folderPath = fileType === 'video' ? '../videos' : '../pdfs';

    // get the path:
    const filePath = await path.join(__dirname, `${folderPath}/${req.file.filename}`)
    const result = await UploadImage(filePath); // UploadImage بتستخدم resource_type: 'auto'

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

    const course = await Course.findById(req.params.id)
    if (!course) {
        return res.status(404).json({ message: "course not found" })
    }
    res.status(201).json({ status: "success", course })

})

const UpdateCourse = asynchandler(async (req, res) => {

    const { teacher_id, title, description, category, price } = req.body
    const { error } = validatupdatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let course = await Course.findById(req.params.id)
    if (!course) {
        return res.status(404).json({ message: "course not found" })
    }
    course = await Course.findByIdAndUpdate({ _id: req.params.id }, {
        $set: {
            teacher_id,
            title,
            description,
            category,
            price
        }
    }, { new: true })
    return res.status(202).json({ status: "success", course: course })

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
    await Course.deleteOne({ _id: req.params.id })

    res.status(201).json({ status: "success", message: "course deleted seccussfully" })

})



module.exports = {
    CreateCourse,
    PostCourseFiles,
    GetCourse,
    UpdateCourse,
    GetCourses,
    DeleteCourse
}