const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { GetParents, GetParent, CreateParent, UpdateParent, DeleteParent } = require('../controller/ParentController');
const { DeleteReport, UpdateReport, CreateReport, GetReport, GetReports } = require('../controller/ReportController');
const { GetReviews, GetReview, CreateReview, UpdateReview, DeleteReview } = require('../controller/ReviewController');
const router = express.Router();

// Get All Reviews
router.get('/reviews', GetReviews)

// Get Single Review
router.get('/review/:id', GetReview)

// Create New Review
router.post('/newreview', CreateReview)

// Update Review
router.patch('/review/:id', UpdateReview)

// Delete Review
router.delete('/review/:id', DeleteReview)



module.exports = router;

