const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');


const CreateCourseViewLog = asynchandler(async (req, res) => {
    const { error } = validatecreatecourseviewlog(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewCourseViewLog = CourseViewLog.create({
        course_id: req.body.course_id,
        viewed_at: req.body.viewed_at
    })
    await NewCourseViewLog.save();
    res.status(201).json({ status: "success", courseViewLog: NewCourseViewLog });
})


const GetCourseViewLog = asynchandler(async (req, res) => {
    const courseViewLog = await CourseViewLog.findById(req.params.id);
    if (!courseViewLog) {
        return res.status(404).json({ message: "CourseViewLog not found" });
    }
    res.status(200).json({ status: "success", courseViewLog });
})

const UpdateCourseViewLog = asynchandler(async (req, res) => {
    const { error } = validatupdatecourseviewlog(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let courseViewLog = await CourseViewLog.findById(req.params.id);
    if (!courseViewLog) {
        return res.status(404).json({ message: "CourseViewLog not found" });
    }
    courseViewLog = await CourseViewLog.findByIdAndUpdate(req.params.id, {
        $set: {
            course_id: req.body.course_id,
            viewed_at: req.body.viewed_at
        }
    }, { new: true });
    res.status(200).json({ status: "success", courseViewLog });
})

const GetCourseViewLogs = asynchandler(async (req, res) => {
    const courseViewLogs = await CourseViewLog.find();
    res.status(200).json({ status: "success", courseViewLogs });
})

const DeleteCourseViewLog = asynchandler(async (req, res) => {
    const courseViewLog = await CourseViewLog.findByIdAndDelete(req.params.id);
    if (!courseViewLog) {
        return res.status(404).json({ message: "CourseViewLog not found" });
    }
    res.status(200).json({ status: "success", message: "CourseViewLog deleted" });
})

module.exports = {
    CreateCourseViewLog,
    GetCourseViewLog,
    UpdateCourseViewLog,
    GetCourseViewLogs,
    DeleteCourseViewLog
}
