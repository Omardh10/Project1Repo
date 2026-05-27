const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { GetParents, GetParent, CreateParent, UpdateParent, DeleteParent } = require('../controller/ParentController');
const { DeleteReport, UpdateReport, CreateReport, GetReport, GetReports } = require('../controller/ReportController');
const router = express.Router();

// Get All Reports
router.get('/reports', GetReports)

// Get Single Report
router.get('/report/:id', GetReport)

// Create New Report
router.post('/newreport', CreateReport)

// Update Report
router.patch('/report/:id', UpdateReport)

// Delete Report
router.delete('/report/:id', DeleteReport)



module.exports = router;

