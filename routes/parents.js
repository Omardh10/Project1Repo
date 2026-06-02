const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { GetParents, GetParent, CreateParent, UpdateParent, DeleteParent } = require('../controller/ParentController');
const { verifytoken } = require('../middlware/VerifyTokens');
const router = express.Router();

// Get All Parents
router.get('/', GetParents)

// Get Single Parent
router.get('/:id', GetParent)

// Create New Parent
router.post('/newparent', CreateParent)
// Update Parent
router.patch('/:id',verifytoken, UpdateParent)

// Delete Parent
router.delete('/:id',verifytoken, DeleteParent)



module.exports = router;

