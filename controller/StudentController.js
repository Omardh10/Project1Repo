const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validateupdatestudent, validatecreatestudent } = require("../models/Student");

const CreateStudent = asynchandler(async (req, res) => {

    const{error}=validatecreatestudent(req.body);
    if(error){
        return res.status(403).json({message:error.details[0].message})
    }

    const NewStudent = Student.create({
        userId:req.body.userId,
        points_balance:req.body.points_balance,
        enrolled_courses_count:req.body.enrolled_courses_count
    })
    await NewStudent.save();
    res.status(201).json({status:"success", student:NewStudent});
})


const GetStudent = asynchandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
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

    student = await Student.findByIdAndUpdate(req.params.id, {
        $set: {
            userId: req.body.userId,
            points_balance: req.body.points_balance,
            enrolled_courses_count: req.body.enrolled_courses_count
        }
    }, { new: true });

    res.status(200).json({ status: "success", student });
});

const GetStudents = asynchandler(async (req, res) => {

    const students = await Student.find();
    res.status(200).json({ status: "success", students })

})


const DeleteStudent = asynchandler(async (req, res) => {
    let student = await Student.findById(req.params.id);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    await Student.deleteOne({ _id: req.params.id });
    res.status(200).json({ status: "success", message: "Student deleted successfully" });
})



module.exports = {
    CreateStudent,
    GetStudent,
    UpdateStudent,
    GetStudents,
    DeleteStudent
}