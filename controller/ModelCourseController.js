const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreatemodelcourse, validatupdatemodelcourse } = require("../models/ModelCourse");

const CreateModelCourse = asynchandler(async (req, res) => {

    const {error}=validatecreatemodelcourse(req.body);
    if(error){
        return res.status(403).json({message:error.details[0].message})
    }
     let newmodelcourse = new ModelCourse({
        teacher_id: req.user.id,
        courses: req.body.courses
    })
    newmodelcourse = await newmodelcourse.save();
    res.status(201).json({ status: "success", modelcourse: newmodelcourse
     });
})


const GetModelCourse = asynchandler(async (req, res) => {

    const modelcourse = await ModelCourse.findById(req.params.id).populate('teacher_id');
    if (!modelcourse) {
        return res.status(404).json({ message: "modelcourse not found" })
    }
    res.status(201).json({ status: "success", modelcourse })

})

const UpdateModelCourse = asynchandler(async (req, res) => {

    const { error } = validatupdatemodelcourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let modelcourse = await ModelCourse.findById(req.params.id).populate('teacher_id');
    if (!modelcourse) {
        return res.status(404).json({ message: "modelcourse not found" })
    }
    if (modelcourse.teacher_id.userId.toString() == req.user._id.toString()) {
        modelcourse = await ModelCourse.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                courses: req.body.courses
            }
        }, { new: true })
        return res.status(202).json({ status: "success", modelcourse: modelcourse })
    } else { return res.status(403).json({ message: "you are not authorized to update this course" }) }

})


const GetModelCourses = asynchandler(async (req, res) => {

    const modelcourses = await ModelCourse.find().populate('teacher_id');
    res.status(200).json({ status: "success", modelcourses })

})

const DeleteModelCourse = asynchandler(async (req, res) => {

    let modelcourse = await ModelCourse.findById(req.params.id)
    if (!modelcourse) {
        return res.status(404).json({ message: "modelcourse not found" })
    }
    if (modelcourse.teacher_id.userId.toString() == req.user._id.toString() || req.user.role == 'admin') {
        await ModelCourse.deleteOne({ _id: req.params.id })

        res.status(201).json({ status: "success", message: "course deleted seccussfully" })
    } else {
        return res.status(403).json({ message: "you are not authorized to delete this course" })
    }

})



module.exports = {
    CreateModelCourse,
    GetModelCourse,
    GetModelCourses,
    UpdateModelCourse,
    DeleteModelCourse
}