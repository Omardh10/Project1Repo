const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreateenrollment, validateupdateenrollment } = require("../models/Enrollment");


const CreateEnrollment = asynchandler(async (req, res) => {
    const{error}=validatecreateenrollment(req.body);
    if(error){
        return res.status(403).json({message:error.details[0].message})
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
})

const GetEnrollments = asynchandler(async (req, res) => {
    const enrollments = await Enrollment.find();
    res.status(200).json({ status: "success", enrollments });
})

const DeleteEnrollment = asynchandler(async (req, res) => {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    res.status(200).json({ status: "success", message: "Enrollment deleted" });
})

module.exports = {
  CreateEnrollment,
  GetEnrollment,
  UpdateEnrollment,
  GetEnrollments,
  DeleteEnrollment
}
