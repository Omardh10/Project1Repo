const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { GetParents, GetParent, CreateParent, UpdateParent, DeleteParent } = require('../controller/ParentController');
const { DeleteReport, UpdateReport, CreateReport, GetReport, GetReports } = require('../controller/ReportController');
const { verifytoken } = require('../middlware/VerifyTokens');
const router = express.Router();

// Get All Reports
router.get('/', GetReports)

// Get Single Report
router.get('/:id', GetReport)

// Create New Report
router.post('/newreport', CreateReport)

// Update Report
router.patch('/:id', verifytoken, UpdateReport)

// Delete Report
router.delete('/:id', verifytoken, DeleteReport)



module.exports = router;

