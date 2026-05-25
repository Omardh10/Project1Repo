const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validateupdatereport, validatecreatereport } = require("../models/Report");


const CreateReport = asynchandler(async (req, res) => {
    const { error } = validatecreatereport(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewReport = Report.create({
        student_id: req.body.student_id,
        parent_id: req.body.parent_id,
        course_id: req.body.course_id,
        report_data: req.body.report_data
    })
    await NewReport.save();
    res.status(201).json({ status: "success", report: NewReport });
})


const GetReport = asynchandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
        return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({ status: "success", report });
})

const UpdateReport = asynchandler(async (req, res) => {
    const { error } = validateupdatereport(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let report = await Report.findById(req.params.id);
    if (!report) {
        return res.status(404).json({ message: "Report not found" });
    }
    report = await Report.findByIdAndUpdate(req.params.id, {
        $set: {
            student_id: req.body.student_id,
            parent_id: req.body.parent_id,
            course_id: req.body.course_id,
            report_data: req.body.report_data
        }
    }, { new: true });
    res.status(200).json({ status: "success", report });
})

const GetReports = asynchandler(async (req, res) => {
    const reports = await Report.find();
    res.status(200).json({ status: "success", reports })
})

const DeleteReport = asynchandler(async (req, res) => {
    let report = await Report.findById(req.params.id);
    if (!report) {
        return res.status(404).json({ message: "Report not found" });
    }
    await Report.deleteOne({ _id: req.params.id });
    res.status(200).json({ status: "success", message: "Report deleted successfully" })
})

module.exports = {
  CreateReport,
  GetReport,
  UpdateReport,
  GetReports,
  DeleteReport
}
