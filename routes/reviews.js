const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { GetParents, GetParent, CreateParent, UpdateParent, DeleteParent } = require('../controller/ParentController');
const { DeleteReport, UpdateReport, CreateReport, GetReport, GetReports } = require('../controller/ReportController');
const { GetReviews, GetReview, CreateReview, UpdateReview, DeleteReview } = require('../controller/ReviewController');
const { verifytoken } = require('../middlware/VerifyTokens');
const router = express.Router();

// Get All Reviews
router.get('/', GetReviews)

// Get Single Review
router.get('/:id', GetReview)

// Create New Review
router.post('/newreview',verifytoken, CreateReview)

// Update Review
router.patch('/:id', verifytoken, UpdateReview)

// Delete Review
router.delete('/:id', verifytoken, DeleteReview)



module.exports = router;

