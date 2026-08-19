const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validateupdatestudent, validatecreatestudent, Student } = require("../models/Student");
const { User } = require("../models/User");

const CreateStudent = asynchandler(async (req, res) => {

    const { error } = validatecreatestudent(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }

    const NewStudent = new Student({
        userId: req.body.userId,
        points_balance: req.body.points_balance,
        enrolled_courses_count: req.body.enrolled_courses_count
    })
    NewStudent.save();

    res.status(201).json({ status: "success", student: NewStudent });
})


const GetStudent = asynchandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ status: "success", student });
});

const GetStudentByUserId = asynchandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.params.userId });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ status: "success", student });
});

const UpdateStudent = asynchandler(async (req, res) => {

    let student = await Student.findById(req.params.id);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    const { error } = validateupdatestudent(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    if (student.userId.toString() == req.user.id || req.user.role == "admin") {
        student = await Student.findByIdAndUpdate(req.params.id, {
            $set: {
                userId: req.body.userId,
                points_balance: req.body.points_balance,
                enrolled_courses_count: req.body.enrolled_courses_count
            }
        }, { new: true });

        res.status(200).json({ status: "success", student });
    } else {
        res.status(403).json({ message: "You are not authorized to update this student" })
    }
});

const ChargeStudentBalance = asynchandler(async (req, res) => {
    let student = await Student.findOne({ userId: req.user.id });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const currentBalance = Number(student.money_balance) || 0;
    
    const amountToAdd = Number(req.body.amount) || 0;
    if (amountToAdd < 0) {
        return res.status(400).json({ message: "Invalid student balance" });
    }

    student.money_balance = currentBalance + amountToAdd;

    await student.save();


    return res.status(200).json({ status: "success", student });

});
const GetStudents = asynchandler(async (req, res) => {

    const students = await User.find({ role: 'student' })
    return res.status(200).json({ status: "success", students })

})


const DeleteStudent = asynchandler(async (req, res) => {
    let student = await Student.findById(req.params.id);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    if (student.userId.toString() == req.user.id || req.user.role == "admin") {
        await Student.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: "success", message: "Student deleted successfully" });
    } else {
        res.status(403).json({ message: "You are not authorized to delete this student" })
    }
})



module.exports = {
    CreateStudent,
    GetStudent,
    UpdateStudent,
    GetStudents,
    DeleteStudent,
    GetStudentByUserId,
    ChargeStudentBalance
}