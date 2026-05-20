const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');


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

const UpdateTeacher = asynchandler(async (req, res) => {
    const { error } = validatupdateteacher(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    teacher = await Teacher.findByIdAndUpdate(req.params.id, {
        $set: {
            userId: req.body.userId,
            total_student: req.body.total_student,
            total_courses: req.body.total_courses
        }
    }, { new: true })
    res.status(202).json({ status: "success", teacher })
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
    await Teacher.deleteOne({ _id: req.params.id });
    res.status(200).json({ status: "success", message: "Teacher deleted successfully" })

})

module.exports = {
    CreateTeacher,
    GetTeacher,
    UpdateTeacher,
    GetTeachers,
    DeleteTeacher
}